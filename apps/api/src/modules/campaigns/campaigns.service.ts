import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CampaignStatus, LeadStatus } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { PrismaService } from '../../common/services/prisma.service';
import { EmailService } from '../emails/email.service';
import {
  PaginationDto,
  PaginatedResult,
  createPaginatedResult,
} from '../../common/dto/pagination.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(customerId: string, createCampaignDto: CreateCampaignDto) {
    // Verify customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Create campaign with pricePerLead = null
    // Admin will set the price after analyzing the market (GO/NO-GO decision)
    const campaign = await this.prisma.campaign.create({
      data: {
        customerId,
        name: createCampaignDto.name,
        description: createCampaignDto.description,
        targetCriteria: createCampaignDto.targetCriteria,
        budget: createCampaignDto.budget,
        maxLeads: createCampaignDto.maxLeads,
        // pricePerLead is null - will be set by admin after pricing analysis
        status: CampaignStatus.DRAFT,
      },
      include: {
        emailSequences: true,
      },
    });

    // Send notifications to admins (non-blocking)
    try {
      // Fetch campaign with customer relation for email notification
      const campaignWithCustomer = await this.prisma.campaign.findUnique({
        where: { id: campaign.id },
        include: { customer: true },
      });

      if (campaignWithCustomer) {
        // Send notification emails (doesn't throw, handles errors internally)
        await this.emailService.sendCampaignNotificationToAdmins(
          campaignWithCustomer,
        );
      }
    } catch (error) {
      // Log error but don't fail campaign creation
      this.logger.error(
        `Failed to send admin notifications for campaign ${campaign.id}`,
        error,
      );
    }

    return campaign;
  }

  async findAll(
    customerId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: { customerId },
        include: {
          emailSequences: true,
          _count: {
            select: { leads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.campaign.count({ where: { customerId } }),
    ]);

    return createPaginatedResult(campaigns, total, page, limit);
  }

  async findOne(customerId: string, id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        emailSequences: {
          orderBy: { step: 'asc' },
        },
        leads: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    // Ensure campaign belongs to customer
    if (campaign.customerId !== customerId) {
      throw new ForbiddenException('Access denied to this campaign');
    }

    return campaign;
  }

  async update(
    customerId: string,
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ) {
    // Verify campaign exists and belongs to customer
    const existing = await this.findOne(customerId, id);

    // Don't allow status changes to ACTIVE if no email sequences
    if (
      updateCampaignDto.status === CampaignStatus.ACTIVE &&
      existing.emailSequences.length === 0
    ) {
      throw new ForbiddenException(
        'Cannot activate campaign without email sequences',
      );
    }

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        name: updateCampaignDto.name,
        description: updateCampaignDto.description,
        status: updateCampaignDto.status,
        targetCriteria: updateCampaignDto.targetCriteria,
        budget: updateCampaignDto.budget,
        maxLeads: updateCampaignDto.maxLeads,
      },
      include: {
        emailSequences: true,
      },
    });

    return campaign;
  }

  async remove(customerId: string, id: string) {
    // Verify campaign exists and belongs to customer
    await this.findOne(customerId, id);

    // Don't allow deletion of active campaigns
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: { status: true },
    });

    if (
      campaign &&
      (campaign.status === CampaignStatus.ACTIVE || campaign.status === CampaignStatus.WARMUP)
    ) {
      throw new ForbiddenException(
        'Cannot delete active or warming campaign. Please pause or cancel first.',
      );
    }

    await this.prisma.campaign.delete({
      where: { id },
    });

    return { message: 'Campaign deleted successfully' };
  }

  async getStats(customerId: string, id: string) {
    const campaign = await this.findOne(customerId, id);

    const pricePerLead = campaign.pricePerLead ?? 0;
    const spent = campaign.totalPaid * pricePerLead;

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      totalContacted: campaign.totalContacted,
      totalReplies: campaign.totalReplies,
      totalQualified: campaign.totalQualified,
      totalPaid: campaign.totalPaid,
      replyRate:
        campaign.totalContacted > 0
          ? (campaign.totalReplies / campaign.totalContacted) * 100
          : 0,
      qualificationRate:
        campaign.totalReplies > 0
          ? (campaign.totalQualified / campaign.totalReplies) * 100
          : 0,
      budget: campaign.budget,
      pricePerLead: campaign.pricePerLead,
      spent,
      remaining: campaign.budget - spent,
    };
  }

  async getDashboardStats(customerId: string) {
    // Execute all queries in parallel for better performance
    const [
      totalCampaigns,
      recentCampaigns,
      activeLeads,
      qualifiedLeads,
      revenueResult,
    ] = await Promise.all([
      // Get total campaigns count
      this.prisma.campaign.count({
        where: { customerId },
      }),

      // Get recent campaigns (last 5)
      this.prisma.campaign.findMany({
        where: { customerId },
        select: {
          id: true,
          name: true,
          status: true,
          totalContacted: true,
          totalQualified: true,
          _count: {
            select: { leads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Get active leads count (CONTACTED, OPENED, REPLIED, INTERESTED)
      this.prisma.lead.count({
        where: {
          customerId,
          status: {
            in: [
              LeadStatus.CONTACTED,
              LeadStatus.OPENED,
              LeadStatus.REPLIED,
              LeadStatus.INTERESTED,
            ],
          },
        },
      }),

      // Get qualified leads count
      this.prisma.lead.count({
        where: {
          customerId,
          status: LeadStatus.QUALIFIED,
        },
      }),

      // Calculate revenue using aggregate instead of loading all records
      this.prisma.lead.aggregate({
        where: {
          customerId,
          status: LeadStatus.PAID,
        },
        _sum: {
          paidAmount: true,
        },
      }),
    ]);

    const revenue = revenueResult._sum.paidAmount || 0;

    // Calculate growth percentages (mock for now, would need historical data)
    return {
      totalCampaigns,
      totalCampaignsGrowth: totalCampaigns > 0 ? '+15%' : '0%',
      activeLeads,
      activeLeadsGrowth: activeLeads > 0 ? '+27%' : '0%',
      qualifiedLeads,
      qualifiedLeadsGrowth: qualifiedLeads > 0 ? '+12%' : '0%',
      revenue,
      revenueGrowth: revenue > 0 ? '+32%' : '0%',
      recentCampaigns: recentCampaigns.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        leads: c._count.leads,
        qualified: c.totalQualified,
      })),
    };
  }
}
