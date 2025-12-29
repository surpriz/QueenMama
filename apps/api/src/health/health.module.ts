import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../common/services/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
