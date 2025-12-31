import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRechargeDto {
  @ApiProperty({
    description: 'Number of lead credits to purchase',
    enum: [5, 10],
    example: 5,
  })
  @IsIn([5, 10], { message: 'Lead count must be 5 or 10' })
  leadCount!: 5 | 10;

  @ApiPropertyOptional({
    description: 'Lead ID to auto-unlock after recharge',
  })
  @IsOptional()
  @IsString()
  pendingLeadId?: string;
}
