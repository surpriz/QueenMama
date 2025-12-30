import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CookieOptions } from 'express';
import { PrismaService } from '../../common/services/prisma.service';
import { EmailService } from '../emails/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private tokenExpiryHours: number;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.tokenExpiryHours = parseInt(
      this.configService.get('VERIFICATION_TOKEN_EXPIRY_HOURS') || '24',
      10,
    );
  }

  getCookieOptions(): CookieOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };
  }

  getLogoutCookieOptions(): CookieOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    };
  }

  private generateVerificationToken(): string {
    return crypto.randomUUID();
  }

  private getTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + this.tokenExpiryHours);
    return expiry;
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.customer.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiresAt = this.getTokenExpiry();

    // Create user with verification token
    const user = await this.prisma.customer.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        company: registerDto.company,
        isVerified: false,
        verificationToken,
        verificationTokenExpiresAt,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.firstName || undefined,
      );
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', error);
    }

    // Return success message (no JWT token yet - user needs to verify email first)
    return {
      message: 'Un email de verification a ete envoye a votre adresse email.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.customer.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is blocked
    if (user.status === 'BLOCKED') {
      throw new ForbiddenException('Votre compte a ete bloque');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new ForbiddenException('Veuillez verifier votre email avant de vous connecter');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async verifyEmail(token: string) {
    // Find user with this token
    const user = await this.prisma.customer.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de verification invalide');
    }

    // Check if token has expired
    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      throw new BadRequestException('Le token de verification a expire. Veuillez demander un nouveau lien.');
    }

    // Update user as verified
    await this.prisma.customer.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    return {
      message: 'Votre email a ete verifie avec succes. Vous pouvez maintenant vous connecter.',
    };
  }

  async resendVerificationEmail(email: string) {
    // Find user
    const user = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not
      return {
        message: 'Si cette adresse email existe, un email de verification a ete envoye.',
      };
    }

    // Check if already verified
    if (user.isVerified) {
      throw new BadRequestException('Cet email est deja verifie');
    }

    // Generate new verification token
    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiresAt = this.getTokenExpiry();

    // Update user with new token
    await this.prisma.customer.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiresAt,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.firstName || undefined,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email');
    }

    return {
      message: 'Si cette adresse email existe, un email de verification a ete envoye.',
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      role: user.role,
      isVerified: user.isVerified,
    };
  }
}
