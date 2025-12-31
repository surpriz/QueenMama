import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  HttpCode,
  UseGuards,
  BadRequestException,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';
import { CreateRechargeDto } from './dto/create-recharge.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private paymentsService: PaymentsService,
    private stripeService: StripeService,
  ) {}

  /**
   * Stripe Webhook Handler
   * NO AUTH - Verified by Stripe signature
   */
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Stripe webhooks (no auth - signature verified)' })
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Get raw body for signature verification
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body for webhook verification');
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    this.logger.log(`Received Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.paymentsService.handleCheckoutCompleted(event.data.object);
        break;
      case 'checkout.session.expired':
        await this.paymentsService.handleCheckoutExpired(event.data.object);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Create deposit checkout for campaign (Admin only)
   * Called after setting campaign pricing
   */
  @Post('campaigns/:id/deposit')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create deposit checkout for campaign (admin only)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  async createDeposit(@Param('id') campaignId: string) {
    return this.paymentsService.createDepositPayment(campaignId);
  }

  /**
   * Create credit recharge checkout
   */
  @Post('campaigns/:id/recharge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create credit recharge checkout' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  async createRecharge(
    @Param('id') campaignId: string,
    @Body() dto: CreateRechargeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const customerId = req.user.id;
    return this.paymentsService.createCreditRecharge(
      customerId,
      campaignId,
      dto.leadCount,
      dto.pendingLeadId,
    );
  }

  /**
   * Get campaign credit balance
   */
  @Get('campaigns/:id/credits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campaign credit balance' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  async getCampaignCredits(
    @Param('id') campaignId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const customerId = req.user.id;
    return this.paymentsService.getCampaignCredits(campaignId, customerId);
  }
}
