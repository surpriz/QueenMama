import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads for authenticated customer' })
  @ApiResponse({ status: 200, description: 'Paginated list of leads (emails masked for non-revealed)' })
  async getAllLeads(
    @Query() pagination: PaginationDto,
    @Req() req: Request,
  ) {
    const customerId = (req.user as AuthenticatedUser).userId;
    return this.leadsService.getAllLeads(customerId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single lead details' })
  @ApiResponse({ status: 200, description: 'Lead details' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async getLeadById(@Param('id') id: string, @Req() req: Request) {
    const customerId = (req.user as AuthenticatedUser).userId;
    return this.leadsService.getLeadById(id, customerId);
  }

  @Post(':id/unlock')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({ summary: 'Unlock lead (payment + reveal contact info)' })
  @ApiResponse({ status: 200, description: 'Lead unlocked successfully' })
  @ApiResponse({ status: 400, description: 'Lead already unlocked or not qualified' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async unlockLead(@Param('id') id: string, @Req() req: Request) {
    const customerId = (req.user as AuthenticatedUser).userId;
    return this.leadsService.unlockLead(id, customerId);
  }
}
