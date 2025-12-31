import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SesMonitoringService } from './ses-monitoring.service';
import { PaymentsModule } from '../payments/payments.module';
import { EmailModule } from '../emails/email.module';

@Module({
  imports: [PaymentsModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService, SesMonitoringService],
  exports: [AdminService, SesMonitoringService],
})
export class AdminModule {}
