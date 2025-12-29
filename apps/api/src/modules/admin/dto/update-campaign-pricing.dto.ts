import { IsNumber, IsEnum, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarketDifficulty } from '@prisma/client';

export class UpdateCampaignPricingDto {
  @ApiProperty({
    description: 'Estimated TAM (Total Addressable Market) - number of prospects found',
    example: 2500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  estimatedTam!: number;

  @ApiProperty({
    description: 'Market difficulty level',
    enum: MarketDifficulty,
    example: 'MEDIUM',
  })
  @IsEnum(MarketDifficulty)
  marketDifficulty!: MarketDifficulty;

  @ApiProperty({
    description: 'Price per lead in euros',
    example: 45,
    minimum: 25,
    maximum: 70,
  })
  @IsNumber()
  @Min(25)
  @Max(70)
  pricePerLead!: number;

  @ApiPropertyOptional({
    description: 'Admin notes about the pricing decision',
    example: 'Good market size, standard pricing applied',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class AnalyzePricingDto {
  @ApiProperty({
    description: 'Estimated TAM (Total Addressable Market)',
    example: 2500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  estimatedTam!: number;

  @ApiProperty({
    description: 'Market difficulty level',
    enum: MarketDifficulty,
    example: 'MEDIUM',
  })
  @IsEnum(MarketDifficulty)
  marketDifficulty!: MarketDifficulty;
}
