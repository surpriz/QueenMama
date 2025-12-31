import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { StripeService } from './stripe.service';
import {
  DepositStatus,
  PaymentStatus,
  PaymentType,
  LeadStatus,
  CampaignStatus,
} from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  /**
   * Create deposit payment for campaign activation
   * Called after admin sets pricing
   */
  async createDepositPayment(campaignId: string): Promise<{ checkoutUrl: string }> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { customer: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (!campaign.pricePerLead) {
      throw new BadRequestException('Campaign pricing not set');
    }

    if (campaign.depositStatus === DepositStatus.PAID) {
      throw new BadRequestException('Deposit already paid');
    }

    // Ensure customer has Stripe customer ID
    let stripeCustomerId = campaign.customer.stripeCustomerId;
    if (!stripeCustomerId) {
      const customerName = [campaign.customer.firstName, campaign.customer.lastName]
        .filter(Boolean)
        .join(' ');

      stripeCustomerId = await this.stripeService.getOrCreateCustomer({
        id: campaign.customer.id,
        email: campaign.customer.email,
        name: customerName || undefined,
      });

      await this.prisma.customer.update({
        where: { id: campaign.customer.id },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe Checkout Session
    const checkout = await this.stripeService.createDepositCheckout({
      stripeCustomerId,
      campaignId,
      campaignName: campaign.name,
      pricePerLead: campaign.pricePerLead,
      customerEmail: campaign.customer.email,
    });

    // Update campaign with checkout info
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        depositStatus: DepositStatus.CHECKOUT_CREATED,
        depositCheckoutId: checkout.sessionId,
      },
    });

    // Create pending payment record
    await this.prisma.payment.create({
      data: {
        customerId: campaign.customerId,
        campaignId,
        type: PaymentType.DEPOSIT,
        amount: campaign.pricePerLead * 2,
        currency: 'EUR',
        status: PaymentStatus.PENDING,
        stripeCheckoutSessionId: checkout.sessionId,
        metadata: {
          campaignId,
          pricePerLead: campaign.pricePerLead,
        },
      },
    });

    this.logger.log(`Created deposit checkout for campaign ${campaignId}: ${checkout.url}`);

    return { checkoutUrl: checkout.url };
  }

  /**
   * Create credit recharge checkout
   */
  async createCreditRecharge(
    customerId: string,
    campaignId: string,
    leadCount: 5 | 10,
    pendingLeadId?: string,
  ): Promise<{ checkoutUrl: string }> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { customer: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.customerId !== customerId) {
      throw new BadRequestException('Not your campaign');
    }

    if (campaign.depositStatus !== DepositStatus.PAID) {
      throw new BadRequestException('Campaign deposit not paid');
    }

    if (!campaign.pricePerLead) {
      throw new BadRequestException('Campaign pricing not set');
    }

    // Ensure Stripe customer exists
    let stripeCustomerId = campaign.customer.stripeCustomerId;
    if (!stripeCustomerId) {
      const customerName = [campaign.customer.firstName, campaign.customer.lastName]
        .filter(Boolean)
        .join(' ');

      stripeCustomerId = await this.stripeService.getOrCreateCustomer({
        id: campaign.customer.id,
        email: campaign.customer.email,
        name: customerName || undefined,
      });

      await this.prisma.customer.update({
        where: { id: campaign.customer.id },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const checkout = await this.stripeService.createCreditRechargeCheckout({
      stripeCustomerId,
      campaignId,
      campaignName: campaign.name,
      pricePerLead: campaign.pricePerLead,
      leadCount,
      pendingLeadId,
    });

    // Create pending payment record
    await this.prisma.payment.create({
      data: {
        customerId,
        campaignId,
        type: PaymentType.CREDIT_RECHARGE,
        amount: campaign.pricePerLead * leadCount,
        currency: 'EUR',
        status: PaymentStatus.PENDING,
        stripeCheckoutSessionId: checkout.sessionId,
        metadata: {
          campaignId,
          leadCount,
          pendingLeadId: pendingLeadId || null,
        },
      },
    });

    // Create pending lead unlock if applicable
    if (pendingLeadId) {
      await this.prisma.pendingLeadUnlock.upsert({
        where: { leadId: pendingLeadId },
        create: {
          leadId: pendingLeadId,
          customerId,
          campaignId,
          stripeCheckoutSessionId: checkout.sessionId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        update: {
          stripeCheckoutSessionId: checkout.sessionId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    this.logger.log(
      `Created recharge checkout for campaign ${campaignId}: ${leadCount} leads`,
    );

    return { checkoutUrl: checkout.url };
  }

  /**
   * Handle successful checkout (webhook)
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata || {};
    const { type, campaignId, creditAmount, pendingLeadId } = metadata;

    this.logger.log(
      `Processing checkout completed: type=${type}, campaignId=${campaignId}, session=${session.id}`,
    );

    // Update payment record
    await this.prisma.payment.updateMany({
      where: { stripeCheckoutSessionId: session.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
      },
    });

    if (type === 'deposit') {
      await this.handleDepositCompleted(campaignId, parseInt(creditAmount || '2', 10));
    } else if (type === 'credit_recharge') {
      await this.handleRechargeCompleted(
        campaignId,
        parseInt(creditAmount || '0', 10),
        pendingLeadId,
      );
    }
  }

  /**
   * Handle deposit payment completed
   */
  private async handleDepositCompleted(
    campaignId: string,
    creditAmount: number,
  ): Promise<void> {
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        depositStatus: DepositStatus.PAID,
        depositPaidAt: new Date(),
        creditBalance: creditAmount,
        status: CampaignStatus.ACTIVE,
        startedAt: new Date(),
      },
    });

    this.logger.log(
      `Campaign ${campaignId} activated with ${creditAmount} credits after deposit payment`,
    );
  }

  /**
   * Handle credit recharge completed
   */
  private async handleRechargeCompleted(
    campaignId: string,
    creditAmount: number,
    pendingLeadId?: string,
  ): Promise<void> {
    // Add credits to campaign
    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        creditBalance: { increment: creditAmount },
      },
    });

    this.logger.log(`Added ${creditAmount} credits to campaign ${campaignId}`);

    // Auto-unlock pending lead if exists
    if (pendingLeadId) {
      await this.autoUnlockLead(pendingLeadId, campaign.pricePerLead!);
    }
  }

  /**
   * Auto-unlock a pending lead after credit recharge
   */
  private async autoUnlockLead(leadId: string, pricePerLead: number): Promise<void> {
    const pending = await this.prisma.pendingLeadUnlock.findUnique({
      where: { leadId },
      include: {
        lead: {
          include: { campaign: true },
        },
      },
    });

    if (!pending) {
      this.logger.warn(`No pending unlock found for lead ${leadId}`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // Decrement credit
      await tx.campaign.update({
        where: { id: pending.campaignId },
        data: {
          creditBalance: { decrement: 1 },
          totalPaid: { increment: 1 },
        },
      });

      // Reveal lead
      await tx.lead.update({
        where: { id: leadId },
        data: {
          isRevealed: true,
          revealedAt: new Date(),
          paidAmount: pricePerLead,
          status: LeadStatus.PAID,
        },
      });

      // Create payment record for the unlock
      await tx.payment.create({
        data: {
          customerId: pending.customerId,
          campaignId: pending.campaignId,
          type: PaymentType.LEAD_UNLOCK,
          amount: pricePerLead,
          currency: 'EUR',
          status: PaymentStatus.SUCCEEDED,
          metadata: {
            leadId,
            autoUnlocked: true,
          },
        },
      });

      // Delete pending record
      await tx.pendingLeadUnlock.delete({
        where: { leadId },
      });
    });

    this.logger.log(`Auto-unlocked lead ${leadId} after recharge`);
  }

  /**
   * Handle expired checkout (webhook)
   */
  async handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata || {};
    const { type, campaignId, pendingLeadId } = metadata;

    this.logger.log(
      `Processing checkout expired: type=${type}, campaignId=${campaignId}, session=${session.id}`,
    );

    // Update payment record
    await this.prisma.payment.updateMany({
      where: { stripeCheckoutSessionId: session.id },
      data: { status: PaymentStatus.CANCELED },
    });

    if (type === 'deposit') {
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { depositStatus: DepositStatus.FAILED },
      });
    }

    // Clean up pending lead unlock
    if (pendingLeadId) {
      await this.prisma.pendingLeadUnlock.deleteMany({
        where: { leadId: pendingLeadId },
      });
    }
  }

  /**
   * Get campaign credit balance
   */
  async getCampaignCredits(campaignId: string, customerId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        customerId: true,
        creditBalance: true,
        depositStatus: true,
        pricePerLead: true,
        totalPaid: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.customerId !== customerId) {
      throw new BadRequestException('Not your campaign');
    }

    return {
      balance: campaign.creditBalance,
      used: campaign.totalPaid,
      depositStatus: campaign.depositStatus,
      pricePerLead: campaign.pricePerLead,
    };
  }

  /**
   * Clean up expired pending unlocks (should be called by a cron job)
   */
  async cleanupExpiredPendingUnlocks(): Promise<number> {
    const result = await this.prisma.pendingLeadUnlock.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired pending lead unlocks`);
    }

    return result.count;
  }
}
