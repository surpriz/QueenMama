import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SesMonitoringService } from './ses-monitoring.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, SesMonitoringService],
  exports: [AdminService, SesMonitoringService],
})
export class AdminModule {}
