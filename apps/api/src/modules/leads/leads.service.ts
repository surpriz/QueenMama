import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
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
   * Unlock lead (payment + reveal)
   */
  async unlockLead(id: string, customerId: string) {
    // Get lead with campaign info
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            pricePerLead: true,
            customerId: true,
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

    const unlockPrice = lead.campaign.pricePerLead;

    // For MVP: Simplified payment (no Stripe)
    // In production: Create Stripe payment intent here

    // Update lead and campaign in transaction
    const updatedLead = await this.prisma.$transaction(async (tx) => {
      // Reveal lead
      const revealedLead = await tx.lead.update({
        where: { id },
        data: {
          isRevealed: true,
          revealedAt: new Date(),
          paidAmount: unlockPrice,
          status: LeadStatus.PAID,
        },
        include: {
          campaign: {
            select: {
              id: true,
              name: true,
            },
          },
          interactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Update campaign totalPaid counter
      await tx.campaign.update({
        where: { id: lead.campaignId },
        data: {
          totalPaid: { increment: 1 },
        },
      });

      // Create payment record (simplified for MVP)
      await tx.payment.create({
        data: {
          customerId,
          type: 'LEAD_UNLOCK',
          amount: unlockPrice,
          currency: 'EUR',
          status: 'SUCCEEDED',
          metadata: {
            leadId: id,
            campaignId: lead.campaignId,
          },
        },
      });

      return revealedLead;
    });

    return {
      message: 'Lead unlocked successfully',
      lead: updatedLead,
      amountPaid: unlockPrice,
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
