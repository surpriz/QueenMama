import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole, AccountStatus } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  // Get admin statistics
  async getStats() {
    const [totalUsers, activeUsers, blockedUsers, admins] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { status: AccountStatus.ACTIVE } }),
      this.prisma.customer.count({ where: { status: AccountStatus.BLOCKED } }),
      this.prisma.customer.count({ where: { role: UserRole.ADMIN } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      admins,
    };
  }

  // Get all users
  async getAllUsers() {
    const users = await this.prisma.customer.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        role: true,
        status: true,
        isVerified: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            campaigns: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  // Get single user
  async getUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        role: true,
        status: true,
        isVerified: true,
        plan: true,
        subscriptionStatus: true,
        credits: true,
        creditsUsed: true,
        createdAt: true,
        updatedAt: true,
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        payments: {
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Block user
  async blockUser(id: string) {
    // Cannot block yourself or other admins
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot block an administrator');
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { status: AccountStatus.BLOCKED },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    return { message: 'User blocked successfully', user: updatedUser };
  }

  // Unblock user
  async unblockUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { status: AccountStatus.ACTIVE },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    return { message: 'User unblocked successfully', user: updatedUser };
  }

  // Demote user (remove admin privileges)
  async demoteUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('User is not an administrator');
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { role: UserRole.USER },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return { message: 'User demoted successfully', user: updatedUser };
  }

  // Promote user to admin
  async promoteUser(id: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('User is already an administrator');
    }

    const updatedUser = await this.prisma.customer.update({
      where: { id },
      data: { role: UserRole.ADMIN },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return { message: 'User promoted successfully', user: updatedUser };
  }

  // Delete user (soft delete)
  async deleteUser(id: string) {
    // Cannot delete yourself or other admins
    const user = await this.prisma.customer.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete an administrator');
    }

    await this.prisma.customer.update({
      where: { id },
      data: { status: AccountStatus.DELETED },
    });

    return { message: 'User deleted successfully' };
  }
}
