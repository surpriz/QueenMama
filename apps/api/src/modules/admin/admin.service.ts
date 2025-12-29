import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, AccountStatus, CampaignStatus, LeadStatus, InteractionType } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';
import { UpdateCampaignDto } from '../campaigns/dto/update-campaign.dto';
import { CreateLeadDto } from '../leads/dto/create-lead.dto';
import { UpdateLeadDto } from '../leads/dto/update-lead.dto';
import {
  PaginationDto,
  PaginatedResult,
  createPaginatedResult,
} from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  // Get admin statistics
  async getStats() {
    const [totalUsers, activeUsers, blockedUsers, admins] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { status: AccountStatus.ACTIVE } }),
      this.prisma.customer.count({ where: { status: AccountStatus.BLOCKED } }),
      this.prisma.customer.count({ where: { role: UserRole.ADMIN } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      admins,
    };
  }

  // Get all users with pagination
  async getAllUsers(pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.customer.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          company: true,
          role: true,
          status: true,
          isVerified: true,
          plan: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              campaigns: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customer.count(),
    ]);

    return createPaginatedResult(users, total, page, limit);
  }

  // Get single user
  async getUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        role: true,
        status: true,
        isVerified: true,
        plan: true,
        subscriptionStatus: true,
        credits: true,
        creditsUsed: true,
        createdAt: true,
        updatedAt: true,
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        payments: {
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Block user
  async blockUser(id: string) {
    // Cannot block yourself or other admins
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot block an administrator');
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { status: AccountStatus.BLOCKED },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    return { message: 'User blocked successfully', user: updatedUser };
  }

  // Unblock user
  async unblockUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { status: AccountStatus.ACTIVE },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    return { message: 'User unblocked successfully', user: updatedUser };
  }

  // Demote user (remove admin privileges)
  async demoteUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('User is not an administrator');
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { role: UserRole.USER },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return { message: 'User demoted successfully', user: updatedUser };
  }

  // Promote user to admin
  async promoteUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('User is already an administrator');
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { role: UserRole.ADMIN },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return { message: 'User promoted successfully', user: updatedUser };
  }

  // Delete user (soft delete)
  async deleteUser(id: string) {
    // Cannot delete yourself or other admins
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete an administrator');
    }

    await this.prisma.customer.update({
      where: { id },
      data: { status: AccountStatus.DELETED },
    });

    return { message: 'User deleted successfully' };
  }

  // ============= CAMPAIGN MANAGEMENT =============

  // Get all campaigns with pagination
  async getAllCampaigns(pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          targetCriteria: true,
          budget: true,
          pricePerLead: true,
          maxLeads: true,
          totalContacted: true,
          totalReplies: true,
          totalQualified: true,
          totalPaid: true,
          createdAt: true,
          updatedAt: true,
          startedAt: true,
          completedAt: true,
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              company: true,
            },
          },
          _count: {
            select: {
              leads: true,
              emailSequences: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // PENDING_REVIEW first
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.campaign.count(),
    ]);

    return createPaginatedResult(campaigns, total, page, limit);
  }

  // Get single campaign
  async getCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        targetCriteria: true,
        budget: true,
        pricePerLead: true,
        maxLeads: true,
        totalContacted: true,
        totalReplies: true,
        totalQualified: true,
        totalPaid: true,
        createdAt: true,
        updatedAt: true,
        startedAt: true,
        completedAt: true,
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            company: true,
            plan: true,
          },
        },
        emailSequences: {
          select: {
            id: true,
            step: true,
            subject: true,
            body: true,
            delayDays: true,
            sent: true,
            opened: true,
            clicked: true,
            replied: true,
          },
          orderBy: { step: 'asc' },
        },
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  // Update campaign
  async updateCampaign(id: string, updateCampaignDto: UpdateCampaignDto) {
    // Verify campaign exists
    const existing = await this.prisma.campaign.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
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
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
        emailSequences: true,
        _count: {
          select: { leads: true },
        },
      },
    });

    return { message: 'Campaign updated successfully', campaign };
  }

  // Approve campaign (PENDING_REVIEW → ACTIVE)
  async approveCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: { id: true, status: true, emailSequences: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Campaign must be in PENDING_REVIEW status to be approved. Current status: ${campaign.status}`,
      );
    }

    if (campaign.emailSequences.length === 0) {
      throw new BadRequestException(
        'Campaign must have at least one email sequence to be approved',
      );
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        status: CampaignStatus.ACTIVE,
        startedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { message: 'Campaign approved successfully', campaign: updatedCampaign };
  }

  // Reject campaign (PENDING_REVIEW → DRAFT)
  async rejectCampaign(id: string, reason?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    if (campaign.status !== CampaignStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Campaign must be in PENDING_REVIEW status to be rejected. Current status: ${campaign.status}`,
      );
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.DRAFT },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Send notification to customer with rejection reason

    return {
      message: reason
        ? `Campaign rejected: ${reason}`
        : 'Campaign rejected successfully',
      campaign: updatedCampaign,
    };
  }

  // ============= LEAD MANAGEMENT =============

  /**
   * Create lead manually (admin)
   */
  async createLead(createLeadDto: CreateLeadDto) {
    // Get campaign to verify it exists and get customer ID
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createLeadDto.campaignId },
      select: {
        id: true,
        customerId: true,
        status: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${createLeadDto.campaignId} not found`);
    }

    // Create lead in transaction (lead + interaction + update stats)
    const lead = await this.prisma.$transaction(async (tx) => {
      // Create lead
      const newLead = await tx.lead.create({
        data: {
          campaignId: createLeadDto.campaignId,
          customerId: campaign.customerId,
          firstName: createLeadDto.firstName,
          lastName: createLeadDto.lastName,
          email: createLeadDto.email,
          company: createLeadDto.company,
          title: createLeadDto.title,
          linkedinUrl: createLeadDto.linkedinUrl,
          phone: createLeadDto.phone,
          companySize: createLeadDto.companySize,
          companyIndustry: createLeadDto.companyIndustry,
          location: createLeadDto.location,
          status: createLeadDto.status || LeadStatus.QUALIFIED,
          qualityScore: createLeadDto.qualityScore,
          sentiment: createLeadDto.sentiment,
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create interaction if response content provided
      if (createLeadDto.responseContent) {
        await tx.interaction.create({
          data: {
            leadId: newLead.id,
            type: InteractionType.EMAIL_REPLIED,
            content: createLeadDto.responseContent,
          },
        });
      }

      // Update campaign stats
      await tx.campaign.update({
        where: { id: createLeadDto.campaignId },
        data: {
          totalContacted: { increment: 1 },
          totalReplies: createLeadDto.responseContent ? { increment: 1 } : undefined,
          totalQualified: createLeadDto.status === LeadStatus.QUALIFIED ? { increment: 1 } : undefined,
        },
      });

      return newLead;
    });

    return {
      message: 'Lead created successfully',
      lead,
    };
  }

  /**
   * Get all leads (admin) with pagination
   */
  async getAllLeads(pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
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
            take: 1,
          },
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.lead.count(),
    ]);

    return createPaginatedResult(leads, total, page, limit);
  }

  /**
   * Get single lead (admin)
   */
  async getLead(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                company: true,
              },
            },
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  /**
   * Update lead (admin)
   */
  async updateLead(id: string, updateLeadDto: UpdateLeadDto) {
    const existingLead = await this.prisma.lead.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingLead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        firstName: updateLeadDto.firstName,
        lastName: updateLeadDto.lastName,
        email: updateLeadDto.email,
        company: updateLeadDto.company,
        title: updateLeadDto.title,
        linkedinUrl: updateLeadDto.linkedinUrl,
        phone: updateLeadDto.phone,
        companySize: updateLeadDto.companySize,
        companyIndustry: updateLeadDto.companyIndustry,
        location: updateLeadDto.location,
        status: updateLeadDto.status,
        qualityScore: updateLeadDto.qualityScore,
        sentiment: updateLeadDto.sentiment,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Lead updated successfully',
      lead: updatedLead,
    };
  }

  /**
   * Delete lead (admin)
   */
  async deleteLead(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      select: { id: true, campaignId: true },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    await this.prisma.lead.delete({
      where: { id },
    });

    return { message: 'Lead deleted successfully' };
  }

  /**
   * Add interaction to lead (admin)
   */
  async addInteraction(
    leadId: string,
    type: InteractionType,
    content?: string,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, campaignId: true },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const interaction = await this.prisma.interaction.create({
      data: {
        leadId,
        type,
        content,
      },
    });

    return {
      message: 'Interaction added successfully',
      interaction,
    };
  }
}
