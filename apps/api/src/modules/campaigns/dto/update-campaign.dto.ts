import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { CampaignStatus } from '@prisma/client';

export class UpdateCampaignDto {
  @ApiPropertyOptional({
    description: 'Campaign name',
    example: 'Q1 2025 Outreach - SaaS Startups (Updated)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Campaign description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Campaign status',
    enum: CampaignStatus,
  })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Target criteria (ICP definition)',
  })
  @IsObject()
  @IsOptional()
  targetCriteria?: {
    industries?: string[];
    companySize?: string[];
    locations?: string[];
    titles?: string[];
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Campaign budget in EUR',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of leads to contact',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxLeads?: number;
}
