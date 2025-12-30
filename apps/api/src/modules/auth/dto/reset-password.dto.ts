import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caracteres' })
  newPassword!: string;
}
