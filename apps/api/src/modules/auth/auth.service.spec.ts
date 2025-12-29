import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/services/prisma.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('development'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Corp',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Corp',
      role: 'USER',
      isVerified: false,
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      mockPrismaService.customer.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(registerDto);

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.customer.create).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          company: mockUser.company,
          role: mockUser.role,
          isVerified: mockUser.isVerified,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Corp',
      role: 'USER',
      isVerified: false,
    };

    it('should login user successfully with correct credentials', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          company: mockUser.company,
          role: mockUser.role,
          isVerified: mockUser.isVerified,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('getMe', () => {
    const userId = 'user-123';

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Corp',
      plan: 'STARTER',
      role: 'USER',
      isVerified: true,
    };

    it('should return user profile successfully', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe(userId);

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        company: mockUser.company,
        plan: mockUser.plan,
        role: mockUser.role,
        isVerified: mockUser.isVerified,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.getMe(userId)).rejects.toThrow('User not found');
    });
  });

  describe('getCookieOptions', () => {
    it('should return cookie options for development', () => {
      mockConfigService.get.mockReturnValue('development');

      const options = service.getCookieOptions();

      expect(options).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    });

    it('should return secure cookie options for production', () => {
      mockConfigService.get.mockReturnValue('production');

      const options = service.getCookieOptions();

      expect(options.secure).toBe(true);
    });
  });

  describe('getLogoutCookieOptions', () => {
    it('should return logout cookie options with maxAge 0', () => {
      const options = service.getLogoutCookieOptions();

      expect(options.maxAge).toBe(0);
      expect(options.httpOnly).toBe(true);
    });
  });
});
