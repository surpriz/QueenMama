'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Target,
  Mail,
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  Send,
} from 'lucide-react';
import { useCampaign, useUpdateCampaign } from '@/hooks/use-campaigns';
import { CampaignStatus } from '@/lib/api';

const getStatusBadge = (status: string) => {
  const variants: Record<string, { className: string }> = {
    DRAFT: { className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    PENDING_REVIEW: { className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    WARMUP: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    ACTIVE: { className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    PAUSED: { className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    COMPLETED: { className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    CANCELED: { className: 'bg-red-100 text-red-700 hover:bg-red-200' },
  };
  return variants[status] || variants.DRAFT;
};

const formatStatus = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: campaign, isLoading, error } = useCampaign(id);
  const updateCampaign = useUpdateCampaign();

  const handleSubmitForReview = async () => {
    if (
      confirm(
        'Submit this campaign for review? Once submitted, it will be reviewed by our team before activation.'
      )
    ) {
      try {
        await updateCampaign.mutateAsync({
          id,
          data: { status: CampaignStatus.PENDING_REVIEW },
        });
      } catch (error: any) {
        alert(
          error.response?.data?.message || 'Failed to submit campaign for review'
        );
      }
    }
  };

  const handlePauseCampaign = async () => {
    if (confirm('Pause this campaign? You can resume it later.')) {
      try {
        await updateCampaign.mutateAsync({
          id,
          data: { status: CampaignStatus.PAUSED },
        });
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to pause campaign');
      }
    }
  };

  const handleResumeCampaign = async () => {
    if (confirm('Resume this campaign?')) {
      try {
        await updateCampaign.mutateAsync({
          id,
          data: { status: CampaignStatus.ACTIVE },
        });
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to resume campaign');
      }
    }
  };

  const handleCancelCampaign = async () => {
    if (
      confirm(
        'Cancel this campaign? This action cannot be undone and all scheduled emails will be stopped.'
      )
    ) {
      try {
        await updateCampaign.mutateAsync({
          id,
          data: { status: CampaignStatus.CANCELED },
        });
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to cancel campaign');
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load campaign</p>
          <Button onClick={() => router.push('/campaigns')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusBadge = getStatusBadge(campaign.status);
  const targetCriteria = campaign.targetCriteria || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/campaigns')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {campaign.name}
              </h1>
              {campaign.description && (
                <p className="text-muted-foreground mt-1">
                  {campaign.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={statusBadge.className}>
              {formatStatus(campaign.status)}
            </Badge>
            {campaign.status === 'DRAFT' && (
              <Button
                onClick={handleSubmitForReview}
                disabled={updateCampaign.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </Button>
            )}
            {campaign.status === 'ACTIVE' && (
              <Button
                variant="outline"
                onClick={handlePauseCampaign}
                disabled={updateCampaign.isPending}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause Campaign
              </Button>
            )}
            {campaign.status === 'PAUSED' && (
              <>
                <Button
                  onClick={handleResumeCampaign}
                  disabled={updateCampaign.isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume Campaign
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelCampaign}
                  disabled={updateCampaign.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.totalContacted}</div>
              <p className="text-xs text-muted-foreground">
                Total leads contacted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Replies</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.totalReplies}</div>
              <p className="text-xs text-muted-foreground">
                {campaign.totalContacted > 0
                  ? `${((campaign.totalReplies / campaign.totalContacted) * 100).toFixed(1)}% reply rate`
                  : 'No data yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {campaign.totalQualified}
              </div>
              <p className="text-xs text-muted-foreground">
                Interested leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unlocked</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.totalPaid}</div>
              <p className="text-xs text-muted-foreground">
                Leads you've unlocked
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Target Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Target Criteria (ICP)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetCriteria.industries && targetCriteria.industries.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Industries
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {targetCriteria.industries.map((industry: string) => (
                      <Badge key={industry} variant="secondary">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {targetCriteria.locations && targetCriteria.locations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {targetCriteria.locations.map((location: string) => (
                      <Badge key={location} variant="secondary">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {targetCriteria.titles && targetCriteria.titles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Job Titles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {targetCriteria.titles.map((title: string) => (
                      <Badge key={title} variant="secondary">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {targetCriteria.companySize && targetCriteria.companySize.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Company Sizes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {targetCriteria.companySize.map((size: string) => (
                      <Badge key={size} variant="secondary">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(!targetCriteria.industries || targetCriteria.industries.length === 0) &&
                (!targetCriteria.locations || targetCriteria.locations.length === 0) &&
                (!targetCriteria.titles || targetCriteria.titles.length === 0) &&
                (!targetCriteria.companySize || targetCriteria.companySize.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No targeting criteria defined
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Budget & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Budget</span>
                <span className="text-lg font-bold">€{campaign.budget.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price per Lead</span>
                <span className="text-lg font-semibold">€{campaign.pricePerLead.toFixed(0)}</span>
              </div>
              {campaign.maxLeads && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Leads</span>
                  <span className="text-lg font-semibold">{campaign.maxLeads}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Leads</span>
                  <span className="text-lg font-semibold">
                    {campaign.maxLeads
                      ? Math.min(
                          Math.floor(campaign.budget / campaign.pricePerLead),
                          campaign.maxLeads
                        )
                      : Math.floor(campaign.budget / campaign.pricePerLead)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Sequences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Sequences
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.emailSequences && campaign.emailSequences.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Step</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Delay</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Opened</TableHead>
                    <TableHead className="text-right">Clicked</TableHead>
                    <TableHead className="text-right">Replied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.emailSequences.map((sequence) => (
                    <TableRow key={sequence.id}>
                      <TableCell className="font-medium">
                        Step {sequence.step}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {sequence.subject}
                      </TableCell>
                      <TableCell>
                        {sequence.delayDays === 0
                          ? 'Immediate'
                          : `${sequence.delayDays} day${sequence.delayDays > 1 ? 's' : ''}`}
                      </TableCell>
                      <TableCell className="text-right">{sequence.sent}</TableCell>
                      <TableCell className="text-right">
                        {sequence.opened}
                        {sequence.sent > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((sequence.opened / sequence.sent) * 100).toFixed(0)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {sequence.clicked}
                        {sequence.sent > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((sequence.clicked / sequence.sent) * 100).toFixed(0)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {sequence.replied}
                        {sequence.sent > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({((sequence.replied / sequence.sent) * 100).toFixed(0)}%)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No email sequences configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium">
                {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {campaign.startedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Started</span>
                <span className="text-sm font-medium">
                  {new Date(campaign.startedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {campaign.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-medium">
                  {new Date(campaign.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium">
                {new Date(campaign.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
