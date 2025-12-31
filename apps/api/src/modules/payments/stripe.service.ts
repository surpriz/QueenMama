import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;
  private webhookSecret: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Stripe payments will not work');
    }

    this.stripe = new Stripe(secretKey || '');

    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    this.logger.log('Stripe Service initialized');
    this.logger.log(`  - Frontend URL: ${this.frontendUrl}`);
  }

  /**
   * Create or retrieve Stripe customer for a Queen Mama customer
   */
  async getOrCreateCustomer(customer: {
    id: string;
    email: string;
    name?: string;
  }): Promise<string> {
    try {
      // Search for existing customer by email
      const existingCustomers = await this.stripe.customers.list({
        email: customer.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        this.logger.log(`Found existing Stripe customer for ${customer.email}`);
        return existingCustomers.data[0].id;
      }

      // Create new Stripe customer
      const stripeCustomer = await this.stripe.customers.create({
        email: customer.email,
        name: customer.name || undefined,
        metadata: {
          queenMamaCustomerId: customer.id,
        },
      });

      this.logger.log(`Created new Stripe customer ${stripeCustomer.id} for ${customer.email}`);
      return stripeCustomer.id;
    } catch (error) {
      this.logger.error(`Failed to create/retrieve Stripe customer: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Create checkout session for campaign deposit (2 leads)
   */
  async createDepositCheckout(params: {
    stripeCustomerId: string;
    campaignId: string;
    campaignName: string;
    pricePerLead: number;
    customerEmail: string;
  }): Promise<{ sessionId: string; url: string }> {
    const depositAmount = params.pricePerLead * 2; // 2 leads deposit

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.stripeCustomerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(depositAmount * 100), // Convert to cents
              product_data: {
                name: `Depot - ${params.campaignName}`,
                description: `Depot initial de garantie pour 2 leads a ${params.pricePerLead}EUR/lead`,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${this.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=deposit`,
        cancel_url: `${this.frontendUrl}/payment/cancel?type=deposit&campaign=${params.campaignId}`,
        metadata: {
          type: 'deposit',
          campaignId: params.campaignId,
          pricePerLead: params.pricePerLead.toString(),
          creditAmount: '2',
        },
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        customer_email: params.stripeCustomerId ? undefined : params.customerEmail,
      });

      this.logger.log(`Created deposit checkout session ${session.id} for campaign ${params.campaignId}`);

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      this.logger.error(`Failed to create deposit checkout: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Create checkout session for credit recharge (5 or 10 leads)
   */
  async createCreditRechargeCheckout(params: {
    stripeCustomerId: string;
    campaignId: string;
    campaignName: string;
    pricePerLead: number;
    leadCount: 5 | 10;
    pendingLeadId?: string;
  }): Promise<{ sessionId: string; url: string }> {
    const totalAmount = params.pricePerLead * params.leadCount;

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.stripeCustomerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(totalAmount * 100), // Convert to cents
              product_data: {
                name: `Recharge Credits - ${params.campaignName}`,
                description: `${params.leadCount} credits lead a ${params.pricePerLead}EUR/lead`,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${this.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=recharge`,
        cancel_url: `${this.frontendUrl}/payment/cancel?type=recharge&campaign=${params.campaignId}`,
        metadata: {
          type: 'credit_recharge',
          campaignId: params.campaignId,
          pricePerLead: params.pricePerLead.toString(),
          creditAmount: params.leadCount.toString(),
          pendingLeadId: params.pendingLeadId || '',
        },
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      });

      this.logger.log(
        `Created recharge checkout session ${session.id} for ${params.leadCount} leads on campaign ${params.campaignId}`,
      );

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      this.logger.error(`Failed to create recharge checkout: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Verify webhook signature and construct event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }

  /**
   * Retrieve checkout session with expanded data
   */
  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'payment_intent'],
    });
  }
}
