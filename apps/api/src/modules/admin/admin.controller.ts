import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UpdateCampaignDto } from '../campaigns/dto/update-campaign.dto';
import { CreateLeadDto } from '../leads/dto/create-lead.dto';
import { UpdateLeadDto } from '../leads/dto/update-lead.dto';
import { UpdateCampaignPricingDto, AnalyzePricingDto } from './dto/update-campaign-pricing.dto';
import { InteractionType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin statistics' })
  @ApiResponse({ status: 200, description: 'Admin statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  async getAllUsers(@Query() pagination: PaginationDto) {
    return this.adminService.getAllUsers(pagination);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/block')
  async blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Patch('users/:id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  @Patch('users/:id/demote')
  async demoteUser(@Param('id') id: string) {
    return this.adminService.demoteUser(id);
  }

  @Patch('users/:id/promote')
  async promoteUser(@Param('id') id: string) {
    return this.adminService.promoteUser(id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ============= CAMPAIGN MANAGEMENT =============

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all campaigns (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated list of all campaigns' })
  async getAllCampaigns(@Query() pagination: PaginationDto) {
    return this.adminService.getAllCampaigns(pagination);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign details (admin)' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaign(@Param('id') id: string) {
    return this.adminService.getCampaign(id);
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update campaign (admin)' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.adminService.updateCampaign(id, updateCampaignDto);
  }

  @Patch('campaigns/:id/approve')
  @ApiOperation({ summary: 'Approve campaign (PENDING_REVIEW → ACTIVE)' })
  @ApiResponse({ status: 200, description: 'Campaign approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid campaign status' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async approveCampaign(@Param('id') id: string) {
    return this.adminService.approveCampaign(id);
  }

  @Patch('campaigns/:id/reject')
  @ApiOperation({ summary: 'Reject campaign (PENDING_REVIEW → DRAFT)' })
  @ApiResponse({ status: 200, description: 'Campaign rejected successfully' })
  @ApiResponse({ status: 400, description: 'Invalid campaign status' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async rejectCampaign(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectCampaign(id, body.reason);
  }

  // ============= PRICING MANAGEMENT =============

  @Post('campaigns/analyze-pricing')
  @ApiOperation({ summary: 'Analyze pricing for a campaign based on TAM and difficulty' })
  @ApiResponse({ status: 200, description: 'Pricing analysis with recommendation' })
  async analyzePricing(@Body() dto: AnalyzePricingDto) {
    return this.adminService.analyzePricing(dto);
  }

  @Patch('campaigns/:id/pricing')
  @ApiOperation({ summary: 'Set campaign pricing (GO decision)' })
  @ApiResponse({ status: 200, description: 'Campaign pricing updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid pricing or campaign status' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateCampaignPricing(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignPricingDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.adminService.updateCampaignPricing(id, dto, admin.id);
  }

  @Get('campaigns/pending-pricing')
  @ApiOperation({ summary: 'Get campaigns awaiting pricing decision' })
  @ApiResponse({ status: 200, description: 'List of campaigns needing pricing' })
  async getCampaignsPendingPricing() {
    return this.adminService.getCampaignsPendingPricing();
  }

  // ============= LEAD MANAGEMENT =============

  @Post('leads')
  @ApiOperation({ summary: 'Create lead manually (admin)' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.adminService.createLead(createLeadDto);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get all leads (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated list of all leads' })
  async getAllLeads(@Query() pagination: PaginationDto) {
    return this.adminService.getAllLeads(pagination);
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get lead details (admin)' })
  @ApiResponse({ status: 200, description: 'Lead details' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async getLead(@Param('id') id: string) {
    return this.adminService.getLead(id);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update lead (admin)' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.adminService.updateLead(id, updateLeadDto);
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete lead (admin)' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async deleteLead(@Param('id') id: string) {
    return this.adminService.deleteLead(id);
  }

  @Post('leads/:id/interactions')
  @ApiOperation({ summary: 'Add interaction to lead (admin)' })
  @ApiResponse({ status: 201, description: 'Interaction added successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async addInteraction(
    @Param('id') id: string,
    @Body() body: { type: InteractionType; content?: string },
  ) {
    return this.adminService.addInteraction(id, body.type, body.content);
  }
}
