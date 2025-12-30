import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
  Statistic,
} from '@aws-sdk/client-cloudwatch';
import {
  SESClient,
  GetSendQuotaCommand,
  ListIdentitiesCommand,
  GetIdentityVerificationAttributesCommand,
} from '@aws-sdk/client-ses';

export interface SESMetrics {
  status: 'healthy' | 'warning' | 'critical';
  region: string;
  sendVolume: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  deliverabilityMetrics: {
    deliveryRate: number;
    bounceRate: number;
    complaintRate: number;
  };
  quotas: {
    maxSendRate: number;
    dailyQuota: number;
    sentLast24Hours: number;
    quotaUsagePercent: number;
  };
  identities: Array<{
    identity: string;
    type: 'Domain' | 'Email';
    status: 'Verified' | 'Pending' | 'Failed';
    dkimVerified: boolean;
  }>;
  lastUpdated: string;
}

@Injectable()
export class SesMonitoringService {
  private readonly logger = new Logger(SesMonitoringService.name);
  private cloudWatchClient: CloudWatchClient | null = null;
  private sesClient: SESClient | null = null;
  private readonly region: string;
  private readonly isConfigured: boolean;
  private readonly configError: string | null = null;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get('AWS_REGION') || 'eu-west-3';

    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    // Validate AWS credentials
    if (!accessKeyId || !secretAccessKey) {
      this.isConfigured = false;
      this.configError = 'AWS_CREDENTIALS_NOT_CONFIGURED';
      this.logger.warn('AWS credentials not configured - SES monitoring disabled. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
      return;
    }

    const credentials = {
      accessKeyId,
      secretAccessKey,
    };

    try {
      this.cloudWatchClient = new CloudWatchClient({
        region: this.region,
        credentials,
      });

      this.sesClient = new SESClient({
        region: this.region,
        credentials,
      });

      this.isConfigured = true;
      this.logger.log(`SES Monitoring Service initialized for region: ${this.region}`);
    } catch (error) {
      this.isConfigured = false;
      this.configError = 'AWS_CLIENT_INIT_FAILED';
      this.logger.error('Failed to initialize AWS clients', error);
    }
  }

  async getMetrics(): Promise<SESMetrics> {
    // Check if AWS is configured
    if (!this.isConfigured) {
      const error = new Error(this.configError || 'AWS_NOT_CONFIGURED');
      error.name = 'AWSConfigurationError';
      throw error;
    }

    try {
      const [sendVolume, deliverability, quotas, identities] = await Promise.all([
        this.getSendVolume(),
        this.getDeliverabilityMetrics(),
        this.getQuotas(),
        this.getIdentities(),
      ]);

      // Determine overall health status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (deliverability.bounceRate > 5 || deliverability.complaintRate > 0.1) {
        status = 'critical';
      } else if (deliverability.bounceRate > 2 || deliverability.complaintRate > 0.05) {
        status = 'warning';
      }

      return {
        status,
        region: this.region,
        sendVolume,
        deliverabilityMetrics: deliverability,
        quotas,
        identities,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Failed to get SES metrics', error);

      // Provide more descriptive error messages
      if (error.name === 'CredentialsProviderError' || error.name === 'InvalidIdentityTokenException') {
        const configError = new Error('AWS_INVALID_CREDENTIALS');
        configError.name = 'AWSConfigurationError';
        throw configError;
      }

      if (error.name === 'AccessDenied' || error.message?.includes('not authorized')) {
        const permError = new Error('AWS_INSUFFICIENT_PERMISSIONS');
        permError.name = 'AWSPermissionError';
        throw permError;
      }

      throw error;
    }
  }

  private async getSendVolume(): Promise<SESMetrics['sendVolume']> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [last24Hours, last7Days, last30Days] = await Promise.all([
      this.getMetricSum('Send', oneDayAgo, now, 3600),
      this.getMetricSum('Send', sevenDaysAgo, now, 86400),
      this.getMetricSum('Send', thirtyDaysAgo, now, 86400),
    ]);

    return {
      last24Hours,
      last7Days,
      last30Days,
    };
  }

  private async getDeliverabilityMetrics(): Promise<SESMetrics['deliverabilityMetrics']> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [sends, bounces, complaints, deliveries] = await Promise.all([
      this.getMetricSum('Send', thirtyDaysAgo, now, 86400),
      this.getMetricSum('Bounce', thirtyDaysAgo, now, 86400),
      this.getMetricSum('Complaint', thirtyDaysAgo, now, 86400),
      this.getMetricSum('Delivery', thirtyDaysAgo, now, 86400),
    ]);

    const totalSends = sends || 1; // Avoid division by zero

    return {
      deliveryRate: Number(((deliveries / totalSends) * 100).toFixed(2)),
      bounceRate: Number(((bounces / totalSends) * 100).toFixed(2)),
      complaintRate: Number(((complaints / totalSends) * 100).toFixed(3)),
    };
  }

  private async getQuotas(): Promise<SESMetrics['quotas']> {
    if (!this.sesClient) {
      return {
        maxSendRate: 0,
        dailyQuota: 0,
        sentLast24Hours: 0,
        quotaUsagePercent: 0,
      };
    }

    try {
      const command = new GetSendQuotaCommand({});
      const response = await this.sesClient.send(command);

      const maxSendRate = response.MaxSendRate || 0;
      const dailyQuota = response.Max24HourSend || 0;
      const sentLast24Hours = response.SentLast24Hours || 0;
      const quotaUsagePercent = dailyQuota > 0
        ? Number(((sentLast24Hours / dailyQuota) * 100).toFixed(2))
        : 0;

      return {
        maxSendRate,
        dailyQuota,
        sentLast24Hours,
        quotaUsagePercent,
      };
    } catch (error) {
      this.logger.error('Failed to get SES quotas', error);
      return {
        maxSendRate: 0,
        dailyQuota: 0,
        sentLast24Hours: 0,
        quotaUsagePercent: 0,
      };
    }
  }

  private async getIdentities(): Promise<SESMetrics['identities']> {
    if (!this.sesClient) {
      return [];
    }

    try {
      // Get all identities
      const listCommand = new ListIdentitiesCommand({});
      const listResponse = await this.sesClient.send(listCommand);
      const identityList = listResponse.Identities || [];

      if (identityList.length === 0) {
        return [];
      }

      // Get verification status for each identity
      const verificationCommand = new GetIdentityVerificationAttributesCommand({
        Identities: identityList,
      });
      const verificationResponse = await this.sesClient.send(verificationCommand);
      const verificationAttributes = verificationResponse.VerificationAttributes || {};

      return identityList.map((identity) => {
        const attrs = verificationAttributes[identity];
        const isEmail = identity.includes('@');

        let status: 'Verified' | 'Pending' | 'Failed' = 'Pending';
        if (attrs?.VerificationStatus === 'Success') {
          status = 'Verified';
        } else if (attrs?.VerificationStatus === 'Failed') {
          status = 'Failed';
        }

        return {
          identity,
          type: isEmail ? 'Email' : 'Domain',
          status,
          dkimVerified: status === 'Verified', // Simplified for now
        };
      });
    } catch (error) {
      this.logger.error('Failed to get SES identities', error);
      return [];
    }
  }

  private async getMetricSum(
    metricName: string,
    startTime: Date,
    endTime: Date,
    period: number,
  ): Promise<number> {
    if (!this.cloudWatchClient) {
      return 0;
    }

    try {
      const command = new GetMetricStatisticsCommand({
        Namespace: 'AWS/SES',
        MetricName: metricName,
        StartTime: startTime,
        EndTime: endTime,
        Period: period,
        Statistics: [Statistic.Sum],
      });

      const response = await this.cloudWatchClient.send(command);
      const datapoints = response.Datapoints || [];

      // Sum all datapoints
      return datapoints.reduce((sum, dp) => sum + (dp.Sum || 0), 0);
    } catch (error) {
      this.logger.error(`Failed to get CloudWatch metric ${metricName}`, error);
      return 0;
    }
  }
}
