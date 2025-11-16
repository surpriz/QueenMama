import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole, AccountStatus } from '@prisma/client';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has ADMIN role
    const customer = await this.prisma.customer.findUnique({
      where: { id: user.id },
      select: { role: true, status: true },
    });

    if (!customer) {
      throw new ForbiddenException('User not found');
    }

    if (customer.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }

    if (customer.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    return true;
  }
}
