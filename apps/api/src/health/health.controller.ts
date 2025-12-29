import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks?: {
    database: 'ok' | 'error';
  };
  error?: string;
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic health check - returns 200 if the server is running
   * Used by Docker healthcheck and load balancers
   */
  @Get()
  async check(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Readiness check - verifies all dependencies are available
   * Used by orchestrators to know when the app is ready to receive traffic
   */
  @Get('ready')
  async ready(): Promise<HealthStatus> {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: 'ok',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: 'error',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
