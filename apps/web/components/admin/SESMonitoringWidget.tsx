'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSesMetrics } from '@/hooks/use-admin';
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  TrendingUp,
  Gauge,
  Globe,
  Loader2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const getStatusConfig = (status: 'healthy' | 'warning' | 'critical') => {
  const configs = {
    healthy: {
      badge: 'bg-green-500/20 text-green-400 border border-green-500/30',
      icon: CheckCircle2,
      label: 'Healthy',
    },
    warning: {
      badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      icon: AlertTriangle,
      label: 'Warning',
    },
    critical: {
      badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
      icon: XCircle,
      label: 'Critical',
    },
  };
  return configs[status];
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

export function SESMonitoringWidget() {
  const { data: metrics, isLoading, isError, error, refetch, isFetching } = useSesMetrics();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'ses-metrics'] });
    refetch();
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </GlassCard>
    );
  }

  if (isError || !metrics) {
    // Extract error message from the error object
    const errorResponse = (error as any)?.response?.data;
    const errorMessage = errorResponse?.message || (error as any)?.message || 'Unknown error';

    // Determine user-friendly message and hint based on error type
    let displayMessage = 'Failed to load SES metrics';
    let hint = '';

    if (errorMessage.includes('AWS_CREDENTIALS_NOT_CONFIGURED')) {
      displayMessage = 'AWS credentials not configured';
      hint = 'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file';
    } else if (errorMessage.includes('AWS_INVALID_CREDENTIALS')) {
      displayMessage = 'Invalid AWS credentials';
      hint = 'Check that your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct';
    } else if (errorMessage.includes('AWS_INSUFFICIENT_PERMISSIONS')) {
      displayMessage = 'Insufficient AWS permissions';
      hint = 'Ensure your IAM user has cloudwatch:GetMetricStatistics and ses:* permissions';
    }

    return (
      <GlassCard className="p-6">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <XCircle className="h-12 w-12 text-red-400" />
          <p className="text-muted-foreground">{displayMessage}</p>
          {hint && (
            <p className="text-sm text-yellow-400 text-center max-w-md">{hint}</p>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="border-white/10 hover:bg-white/5">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  const statusConfig = getStatusConfig(metrics.status);
  const StatusIcon = statusConfig.icon;

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Mail className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">AWS SES Email Monitoring</h2>
              <Badge className={statusConfig.badge}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitoring email deliverability in {metrics.region}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="border-white/10 hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-6">
        {/* Send Volume */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Send className="h-4 w-4 text-blue-400" />
            <h3 className="font-medium">Send Volume</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Last 24 Hours</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatNumber(metrics.sendVolume.last24Hours)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Last 7 Days</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatNumber(metrics.sendVolume.last7Days)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatNumber(metrics.sendVolume.last30Days)}
              </p>
            </div>
          </div>
        </div>

        {/* Deliverability Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <h3 className="font-medium">Deliverability Metrics</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Delivery Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {metrics.deliverabilityMetrics.deliveryRate}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Bounce Rate</p>
              <p className={`text-2xl font-bold ${
                metrics.deliverabilityMetrics.bounceRate > 5 ? 'text-red-400' :
                metrics.deliverabilityMetrics.bounceRate > 2 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {metrics.deliverabilityMetrics.bounceRate}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Complaint Rate</p>
              <p className={`text-2xl font-bold ${
                metrics.deliverabilityMetrics.complaintRate > 0.1 ? 'text-red-400' :
                metrics.deliverabilityMetrics.complaintRate > 0.05 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {metrics.deliverabilityMetrics.complaintRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Send Quotas & Limits */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-purple-400" />
            <h3 className="font-medium">Send Quotas & Limits</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Max Send Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {metrics.quotas.maxSendRate}/sec
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Daily Quota</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatNumber(metrics.quotas.dailyQuota)}/day
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-muted-foreground mb-1">Quota Usage</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${
                  metrics.quotas.quotaUsagePercent > 80 ? 'text-red-400' :
                  metrics.quotas.quotaUsagePercent > 50 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {metrics.quotas.quotaUsagePercent}%
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    metrics.quotas.quotaUsagePercent > 80 ? 'bg-red-500' :
                    metrics.quotas.quotaUsagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.quotas.quotaUsagePercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Identity Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-cyan-400" />
            <h3 className="font-medium">Identity Breakdown</h3>
          </div>
          {metrics.identities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No identities configured
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-muted-foreground">Identity</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">DKIM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.identities.map((identity) => (
                    <TableRow key={identity.identity} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium">{identity.identity}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {identity.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          identity.status === 'Verified'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : identity.status === 'Pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }>
                          {identity.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {identity.dkimVerified ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </p>
      </div>
    </GlassCard>
  );
}
