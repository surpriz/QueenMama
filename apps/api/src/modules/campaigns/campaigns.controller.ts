import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @CurrentUser() user: any,
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(user.id, createCampaignDto);
  }

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'Get dashboard statistics for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
  })
  getDashboardStats(@CurrentUser() user: any) {
    return this.campaignsService.getDashboardStats(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns',
  })
  findAll(@CurrentUser() user: any) {
    return this.campaignsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific campaign by ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign details',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.campaignsService.findOne(user.id, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get campaign statistics' })
  @ApiResponse({
    status: 200,
    description: 'Campaign statistics',
  })
  getStats(@CurrentUser() user: any, @Param('id') id: string) {
    return this.campaignsService.getStats(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(user.id, id, updateCampaignDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 403, description: 'Access denied or cannot delete active campaign' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.campaignsService.remove(user.id, id);
  }
}
