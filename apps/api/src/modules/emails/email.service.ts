import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { getVerificationEmailTemplate } from './templates/verification';
import { getPasswordResetEmailTemplate } from './templates/password-reset';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sesClient: SESClient;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
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
}
