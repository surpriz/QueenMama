import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('CampaignsService', () => {
  let service: CampaignsService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
    },
    campaign: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    lead: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  const mockCustomerId = 'customer-123';

  const mockCustomer = {
    id: mockCustomerId,
  };

  const mockCampaign = {
    id: 'campaign-123',
    customerId: mockCustomerId,
    name: 'Test Campaign',
    description: 'Test Description',
    status: CampaignStatus.DRAFT,
    targetCriteria: { industries: ['tech'], locations: ['France'] },
    budget: 1000,
    maxLeads: 50,
    pricePerLead: null, // Null until admin sets it via GO/NO-GO
    totalContacted: 100,
    totalReplies: 20,
    totalQualified: 10,
    totalPaid: 5,
    emailSequences: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCampaignDto = {
      name: 'New Campaign',
      description: 'Campaign description',
      targetCriteria: { industries: ['tech'] },
      budget: 1000,
      maxLeads: 50,
    };

    it('should create a campaign successfully', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.campaign.create.mockResolvedValue({
        ...mockCampaign,
        ...createCampaignDto,
      });

      const result = await service.create(mockCustomerId, createCampaignDto);

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: mockCustomerId },
        select: { id: true },
      });
      expect(mockPrismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          customerId: mockCustomerId,
          name: createCampaignDto.name,
          description: createCampaignDto.description,
          targetCriteria: createCampaignDto.targetCriteria,
          budget: createCampaignDto.budget,
          maxLeads: createCampaignDto.maxLeads,
          // pricePerLead is null - will be set by admin after GO/NO-GO analysis
          status: CampaignStatus.DRAFT,
        },
        include: {
          emailSequences: true,
        },
      });
      expect(result.name).toBe(createCampaignDto.name);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockCustomerId, createCampaignDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.create(mockCustomerId, createCampaignDto),
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('findAll', () => {
    const pagination = { page: 1, limit: 20 };
    const mockCampaigns = [mockCampaign];

    it('should return paginated campaigns', async () => {
      mockPrismaService.campaign.findMany.mockResolvedValue(mockCampaigns);
      mockPrismaService.campaign.count.mockResolvedValue(1);

      const result = await service.findAll(mockCustomerId, pagination);

      expect(mockPrismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
        include: {
          emailSequences: true,
          _count: {
            select: { leads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({
        data: mockCampaigns,
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });
    });

    it('should calculate correct skip for page 2', async () => {
      mockPrismaService.campaign.findMany.mockResolvedValue([]);
      mockPrismaService.campaign.count.mockResolvedValue(0);

      await service.findAll(mockCustomerId, { page: 2, limit: 10 });

      expect(mockPrismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return campaign if it belongs to customer', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue(mockCampaign);

      const result = await service.findOne(mockCustomerId, mockCampaign.id);

      expect(result).toEqual(mockCampaign);
    });

    it('should throw NotFoundException if campaign not found', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(mockCustomerId, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if campaign belongs to different customer', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue({
        ...mockCampaign,
        customerId: 'different-customer',
      });

      await expect(
        service.findOne(mockCustomerId, mockCampaign.id),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.findOne(mockCustomerId, mockCampaign.id),
      ).rejects.toThrow('Access denied to this campaign');
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Campaign',
      description: 'Updated description',
    };

    it('should update campaign successfully', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue(mockCampaign);
      mockPrismaService.campaign.update.mockResolvedValue({
        ...mockCampaign,
        ...updateDto,
      });

      const result = await service.update(
        mockCustomerId,
        mockCampaign.id,
        updateDto,
      );

      expect(mockPrismaService.campaign.update).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw ForbiddenException when activating campaign without email sequences', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue({
        ...mockCampaign,
        emailSequences: [],
      });

      await expect(
        service.update(mockCustomerId, mockCampaign.id, {
          status: CampaignStatus.ACTIVE,
        }),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(mockCustomerId, mockCampaign.id, {
          status: CampaignStatus.ACTIVE,
        }),
      ).rejects.toThrow('Cannot activate campaign without email sequences');
    });
  });

  describe('remove', () => {
    it('should delete draft campaign successfully', async () => {
      mockPrismaService.campaign.findUnique
        .mockResolvedValueOnce(mockCampaign)
        .mockResolvedValueOnce({ status: CampaignStatus.DRAFT });
      mockPrismaService.campaign.delete.mockResolvedValue(mockCampaign);

      const result = await service.remove(mockCustomerId, mockCampaign.id);

      expect(mockPrismaService.campaign.delete).toHaveBeenCalledWith({
        where: { id: mockCampaign.id },
      });
      expect(result).toEqual({ message: 'Campaign deleted successfully' });
    });

    it('should throw ForbiddenException when deleting active campaign', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue({
        ...mockCampaign,
        status: CampaignStatus.ACTIVE,
      });

      await expect(
        service.remove(mockCustomerId, mockCampaign.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStats', () => {
    it('should return campaign statistics', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue(mockCampaign);

      const result = await service.getStats(mockCustomerId, mockCampaign.id);

      expect(result).toMatchObject({
        id: mockCampaign.id,
        name: mockCampaign.name,
        status: mockCampaign.status,
        totalContacted: mockCampaign.totalContacted,
        totalReplies: mockCampaign.totalReplies,
        totalQualified: mockCampaign.totalQualified,
        totalPaid: mockCampaign.totalPaid,
      });
      expect(result.replyRate).toBe(20); // 20/100 * 100
      expect(result.qualificationRate).toBe(50); // 10/20 * 100
    });

    it('should return 0 rates when no contacts', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValue({
        ...mockCampaign,
        totalContacted: 0,
        totalReplies: 0,
      });

      const result = await service.getStats(mockCustomerId, mockCampaign.id);

      expect(result.replyRate).toBe(0);
      expect(result.qualificationRate).toBe(0);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics with parallel queries', async () => {
      mockPrismaService.campaign.count.mockResolvedValue(5);
      mockPrismaService.campaign.findMany.mockResolvedValue([
        {
          id: 'camp-1',
          name: 'Campaign 1',
          status: CampaignStatus.ACTIVE,
          totalContacted: 100,
          totalQualified: 10,
          _count: { leads: 50 },
        },
      ]);
      mockPrismaService.lead.count
        .mockResolvedValueOnce(150) // activeLeads
        .mockResolvedValueOnce(30); // qualifiedLeads
      mockPrismaService.lead.aggregate.mockResolvedValue({
        _sum: { paidAmount: 1500 },
      });

      const result = await service.getDashboardStats(mockCustomerId);

      expect(result).toMatchObject({
        totalCampaigns: 5,
        activeLeads: 150,
        qualifiedLeads: 30,
        revenue: 1500,
      });
      expect(result.recentCampaigns).toHaveLength(1);
      expect(result.recentCampaigns[0]).toMatchObject({
        id: 'camp-1',
        name: 'Campaign 1',
        leads: 50,
        qualified: 10,
      });
    });

    it('should return 0 revenue when no paid leads', async () => {
      mockPrismaService.campaign.count.mockResolvedValue(0);
      mockPrismaService.campaign.findMany.mockResolvedValue([]);
      mockPrismaService.lead.count.mockResolvedValue(0);
      mockPrismaService.lead.aggregate.mockResolvedValue({
        _sum: { paidAmount: null },
      });

      const result = await service.getDashboardStats(mockCustomerId);

      expect(result.revenue).toBe(0);
      expect(result.totalCampaigns).toBe(0);
    });
  });
});
