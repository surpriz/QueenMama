import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LeadStatus, DepositStatus, PaymentStatus, PaymentType } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';
import {
  PaginationDto,
  PaginatedResult,
  createPaginatedResult,
} from '../../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all leads for a customer with pagination
   */
  async getAllLeads(
    customerId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where: { customerId },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get latest interaction
          },
        },
        orderBy: [
          { status: 'asc' },
          { qualityScore: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where: { customerId } }),
    ]);

    // Mask email for non-revealed leads
    const maskedLeads = leads.map((lead) => ({
      ...lead,
      email: lead.isRevealed ? lead.email : this.maskEmail(lead.email),
      phone: lead.isRevealed ? lead.phone : null,
      linkedinUrl: lead.isRevealed ? lead.linkedinUrl : null,
    }));

    return createPaginatedResult(maskedLeads, total, page, limit);
  }

  /**
   * Get single lead by ID (with ownership check)
   */
  async getLeadById(id: string, customerId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            pricePerLead: true,
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Verify ownership
    if (lead.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    // Mask contact info if not revealed
    if (!lead.isRevealed) {
      lead.email = this.maskEmail(lead.email);
      lead.phone = null;
      lead.linkedinUrl = null;
    }

    return lead;
  }

  /**
   * Unlock lead using credits or return recharge options
   */
  async unlockLead(id: string, customerId: string) {
    // Get lead with campaign info including credit balance
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            pricePerLead: true,
            customerId: true,
            depositStatus: true,
            creditBalance: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Verify ownership
    if (lead.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this lead');
    }

    // Check if already revealed
    if (lead.isRevealed) {
      throw new BadRequestException('Lead is already unlocked');
    }

    // Check if lead is qualified
    if (lead.status !== LeadStatus.QUALIFIED && lead.status !== LeadStatus.INTERESTED) {
      throw new BadRequestException(
        'Only qualified or interested leads can be unlocked',
      );
    }

    // Check if pricing has been set by admin
    if (lead.campaign.pricePerLead === null) {
      throw new BadRequestException(
        'Campaign pricing has not been set yet. Please wait for admin approval.',
      );
    }

    // Check if deposit is paid
    if (lead.campaign.depositStatus !== DepositStatus.PAID) {
      throw new BadRequestException(
        'Campaign deposit not paid. Please complete the deposit payment first.',
      );
    }

    const pricePerLead = lead.campaign.pricePerLead;

    // Check if customer has credits
    if (lead.campaign.creditBalance <= 0) {
      // No credits - return recharge options
      return {
        requiresPayment: true,
        message: 'Insufficient credits. Please recharge to unlock this lead.',
        leadId: id,
        campaignId: lead.campaignId,
        pricePerLead,
        rechargeOptions: [
          {
            leads: 5,
            total: pricePerLead * 5,
            label: '5 leads',
          },
          {
            leads: 10,
            total: pricePerLead * 10,
            label: '10 leads',
          },
        ],
      };
    }

    // Has credits - unlock immediately
    return this.unlockLeadWithCredit(lead, customerId, pricePerLead);
  }

  /**
   * Internal method to unlock a lead using campaign credits
   */
  private async unlockLeadWithCredit(
    lead: any,
    customerId: string,
    pricePerLead: number,
  ) {
    const updatedLead = await this.prisma.$transaction(async (tx) => {
      // Decrement credit balance
      await tx.campaign.update({
        where: { id: lead.campaignId },
        data: {
          creditBalance: { decrement: 1 },
          totalPaid: { increment: 1 },
        },
      });

      // Reveal lead
      const revealedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          isRevealed: true,
          revealedAt: new Date(),
          paidAmount: pricePerLead,
          status: LeadStatus.PAID,
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
              creditBalance: true,
            },
          },
          interactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Create payment record for tracking
      await tx.payment.create({
        data: {
          customerId,
          campaignId: lead.campaignId,
          type: PaymentType.LEAD_UNLOCK,
          amount: pricePerLead,
          currency: 'EUR',
          status: PaymentStatus.SUCCEEDED,
          metadata: {
            leadId: lead.id,
            campaignId: lead.campaignId,
            paidWithCredits: true,
          },
        },
      });

      return revealedLead;
    });

    return {
      requiresPayment: false,
      message: 'Lead unlocked successfully',
      lead: updatedLead,
      amountPaid: pricePerLead,
      remainingCredits: updatedLead.campaign.creditBalance,
    };
  }

  /**
   * Mask email address (e.g., john@example.com -> j***@example.com)
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const maskedLocal = localPart.charAt(0) + '***';
    return `${maskedLocal}@${domain}`;
  }
}
