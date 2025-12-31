import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { UserRole, AccountStatus, Campaign, Customer } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';
import { getVerificationEmailTemplate } from './templates/verification';
import { getPasswordResetEmailTemplate } from './templates/password-reset';
import { getCampaignNotificationTemplate } from './templates/campaign-notification';
import { getDepositRequestTemplate } from './templates/deposit-request';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sesClient: SESClient;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const region = this.configService.get('AWS_REGION') || 'eu-west-3';
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID') || '';

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
    this.fromEmail = this.configService.get('SES_FROM_EMAIL') || 'noreply@queenmama.io';
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

    // Debug logging on startup
    this.logger.log(`Email Service initialized:`);
    this.logger.log(`  - AWS Region: ${region}`);
    this.logger.log(`  - From Email: ${this.fromEmail}`);
    this.logger.log(`  - Frontend URL: ${this.frontendUrl}`);
    this.logger.log(`  - AWS Access Key ID: ${accessKeyId.substring(0, 8)}...`);
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    firstName?: string,
  ): Promise<boolean> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    const { subject, html, text } = getVerificationEmailTemplate(
      firstName || 'Utilisateur',
      verificationUrl,
    );

    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: html,
            },
            Text: {
              Charset: 'UTF-8',
              Data: text,
            },
          },
        },
      });

      const response = await this.sesClient.send(command);
      this.logger.log(`Verification email sent to ${email} from ${this.fromEmail}`);
      this.logger.log(`  - SES MessageId: ${response.MessageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName?: string,
  ): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const { subject, html, text } = getPasswordResetEmailTemplate(
      firstName || 'Utilisateur',
      resetUrl,
    );

    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: html,
            },
            Text: {
              Charset: 'UTF-8',
              Data: text,
            },
          },
        },
      });

      const response = await this.sesClient.send(command);
      this.logger.log(`Password reset email sent to ${email} from ${this.fromEmail}`);
      this.logger.log(`  - SES MessageId: ${response.MessageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  async sendCampaignNotificationToAdmins(
    campaign: Campaign & { customer: Customer },
  ): Promise<void> {
    // 1. Query all active admins
    const admins = await this.prisma.customer.findMany({
      where: {
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // 2. Handle no admins edge case
    if (admins.length === 0) {
      this.logger.warn('No active admins found to notify about new campaign');
      return;
    }

    this.logger.log(
      `Sending campaign notification to ${admins.length} admin(s) for campaign: ${campaign.name}`,
    );

    // 3. Build admin dashboard URL
    const adminDashboardUrl = `${this.frontendUrl}/admin/campaigns/${campaign.id}`;

    // 4. Prepare customer display name
    const customerName =
      campaign.customer.firstName && campaign.customer.lastName
        ? `${campaign.customer.firstName} ${campaign.customer.lastName}`
        : campaign.customer.email;

    // 5. Send emails in parallel using Promise.allSettled
    const sendPromises = admins.map(async (admin) => {
      const adminFirstName = admin.firstName || 'Admin';

      const { subject, html, text } = getCampaignNotificationTemplate(
        adminFirstName,
        customerName,
        campaign.name,
        campaign.description,
        campaign.targetCriteria,
        campaign.budget,
        campaign.maxLeads,
        campaign.id,
        adminDashboardUrl,
      );

      try {
        const command = new SendEmailCommand({
          Source: this.fromEmail,
          Destination: {
            ToAddresses: [admin.email],
          },
          Message: {
            Subject: {
              Charset: 'UTF-8',
              Data: subject,
            },
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: html,
              },
              Text: {
                Charset: 'UTF-8',
                Data: text,
              },
            },
          },
        });

        const response = await this.sesClient.send(command);
        this.logger.log(
          `Campaign notification sent to admin ${admin.email} (MessageId: ${response.MessageId})`,
        );
        return { success: true, email: admin.email };
      } catch (error) {
        this.logger.error(
          `Failed to send campaign notification to admin ${admin.email}`,
          error,
        );
        return { success: false, email: admin.email, error };
      }
    });

    // 6. Wait for all emails and log summary
    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;

    this.logger.log(
      `Campaign notifications completed: ${successCount}/${admins.length} successful`,
    );
  }

  /**
   * Send deposit request email to customer when admin sets pricing
   */
  async sendDepositRequestEmail(
    email: string,
    firstName: string,
    campaignName: string,
    pricePerLead: number,
    depositAmount: number,
    checkoutUrl: string,
  ): Promise<boolean> {
    const { subject, html, text } = getDepositRequestTemplate(
      firstName || 'Client',
      campaignName,
      pricePerLead,
      depositAmount,
      checkoutUrl,
    );

    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: html,
            },
            Text: {
              Charset: 'UTF-8',
              Data: text,
            },
          },
        },
      });

      const response = await this.sesClient.send(command);
      this.logger.log(`Deposit request email sent to ${email} from ${this.fromEmail}`);
      this.logger.log(`  - SES MessageId: ${response.MessageId}`);
      this.logger.log(`  - Campaign: ${campaignName}`);
      this.logger.log(`  - Deposit amount: ${depositAmount} EUR`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send deposit request email to ${email}`, error);
      throw error;
    }
  }
}
