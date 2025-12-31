import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'Acme Corp', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({
    example: '+33 6 12 34 56 78',
    required: false,
    description: 'Phone number in international format with country code'
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+\d{1,3}\s?\d{1,14}$/, {
    message: 'Phone must be in international format (e.g., +33 6 12 34 56 78)'
  })
  phone?: string;
}
