import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Q1 2025 Outreach - SaaS Startups',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Campaign description',
    example: 'Targeting SaaS startups in Europe with 10-50 employees',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Target criteria (ICP definition)',
    example: {
      industries: ['Software', 'SaaS'],
      companySize: ['10-50', '51-200'],
      locations: ['France', 'Germany', 'UK'],
      titles: ['CEO', 'CTO', 'Head of Sales'],
    },
  })
  @IsObject()
  @IsNotEmpty()
  targetCriteria!: {
    industries?: string[];
    companySize?: string[];
    locations?: string[];
    titles?: string[];
    [key: string]: any;
  };

  @ApiProperty({
    description: 'Campaign budget in EUR',
    example: 5000,
  })
  @IsNumber()
  @Min(0)
  budget!: number;

  @ApiPropertyOptional({
    description: 'Maximum number of leads to contact',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxLeads?: number;
}
