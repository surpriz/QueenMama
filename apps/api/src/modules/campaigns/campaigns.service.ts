import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient, Plan } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

const prisma = new PrismaClient();

// Price per lead based on plan
const PRICE_PER_LEAD_MAP = {
  [Plan.PAY_PER_LEAD]: 60,
  [Plan.STARTER]: 30,
  [Plan.GROWTH]: 25,
  [Plan.SCALE]: 20,
};

@Injectable()
export class CampaignsService {
  async create(customerId: string, createCampaignDto: CreateCampaignDto) {
    // Get customer's plan to calculate price per lead
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { plan: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const pricePerLead = PRICE_PER_LEAD_MAP[customer.plan];

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        customerId,
        name: createCampaignDto.name,
        description: createCampaignDto.description,
        targetCriteria: createCampaignDto.targetCriteria,
        budget: createCampaignDto.budget,
        maxLeads: createCampaignDto.maxLeads,
        pricePerLead,
        status: 'DRAFT',
      },
      include: {
        emailSequences: true,
      },
    });

    return campaign;
  }

  async findAll(customerId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { customerId },
      include: {
        emailSequences: true,
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns;
  }

  async findOne(customerId: string, id: string) {
    const campaign = await prisma.campaign.findUnique({
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
      updateCampaignDto.status === 'ACTIVE' &&
      existing.emailSequences.length === 0
    ) {
      throw new ForbiddenException(
        'Cannot activate campaign without email sequences',
      );
    }

    const campaign = await prisma.campaign.update({
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
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { status: true },
    });

    if (
      campaign &&
      (campaign.status === 'ACTIVE' || campaign.status === 'WARMUP')
    ) {
      throw new ForbiddenException(
        'Cannot delete active or warming campaign. Please pause or cancel first.',
      );
    }

    await prisma.campaign.delete({
      where: { id },
    });

    return { message: 'Campaign deleted successfully' };
  }

  async getStats(customerId: string, id: string) {
    const campaign = await this.findOne(customerId, id);

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
      spent: campaign.totalPaid * campaign.pricePerLead,
      remaining: campaign.budget - campaign.totalPaid * campaign.pricePerLead,
    };
  }
}
