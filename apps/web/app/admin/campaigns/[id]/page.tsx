'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Building,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  useAdminCampaign,
  useApproveCampaign,
  useRejectCampaign,
  useUpdateAdminCampaign,
} from '@/hooks/use-admin';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function AdminCampaignDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: campaign, isLoading } = useAdminCampaign(id);
  const approveCampaign = useApproveCampaign();
  const rejectCampaign = useRejectCampaign();
  const updateCampaign = useUpdateAdminCampaign();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Set initial status when campaign loads
  useEffect(() => {
    if (campaign) {
      setSelectedStatus(campaign.status);
    }
  }, [campaign]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleApproveCampaign = async () => {
    if (confirm('Approve this campaign? It will become ACTIVE and start running.')) {
      try {
        await approveCampaign.mutateAsync(id);
        router.push('/admin/campaigns');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to approve campaign');
      }
    }
  };

  const handleRejectCampaign = async () => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      try {
        await rejectCampaign.mutateAsync({ id, reason: reason || undefined });
        router.push('/admin/campaigns');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to reject campaign');
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (confirm(`Change campaign status to ${newStatus}?`)) {
      try {
        await updateCampaign.mutateAsync({
          id,
          data: { status: newStatus as CampaignStatus },
        });
        setSelectedStatus(newStatus);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to update campaign status');
        setSelectedStatus(campaign?.status || '');
      }
    } else {
      setSelectedStatus(campaign?.status || '');
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

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
            <Button onClick={() => router.push('/admin/campaigns')}>
              Back to Campaigns
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusBadge = getStatusBadge(campaign.status);
  const customerName =
    campaign.customer.firstName && campaign.customer.lastName
      ? `${campaign.customer.firstName} ${campaign.customer.lastName}`
      : campaign.customer.email;

  const replyRate =
    campaign.totalContacted > 0
      ? ((campaign.totalReplies / campaign.totalContacted) * 100).toFixed(1)
      : '0.0';

  const qualificationRate =
    campaign.totalReplies > 0
      ? ((campaign.totalQualified / campaign.totalReplies) * 100).toFixed(1)
      : '0.0';

  const spent = campaign.totalPaid * campaign.pricePerLead;
  const remaining = campaign.budget - spent;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/campaigns')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <p className="text-muted-foreground">Campaign Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select
                value={selectedStatus}
                onValueChange={handleStatusChange}
                disabled={updateCampaign.isPending}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-500" />
                      DRAFT
                    </span>
                  </SelectItem>
                  <SelectItem value="PENDING_REVIEW">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      PENDING_REVIEW
                    </span>
                  </SelectItem>
                  <SelectItem value="WARMUP">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      WARMUP
                    </span>
                  </SelectItem>
                  <SelectItem value="ACTIVE">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      ACTIVE
                    </span>
                  </SelectItem>
                  <SelectItem value="PAUSED">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      PAUSED
                    </span>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      COMPLETED
                    </span>
                  </SelectItem>
                  <SelectItem value="CANCELED">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      CANCELED
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Actions for PENDING_REVIEW */}
            {campaign.status === 'PENDING_REVIEW' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleApproveCampaign}
                  disabled={approveCampaign.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRejectCampaign}
                  disabled={rejectCampaign.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{campaign.customer.email}</p>
              </div>
            </div>
            {campaign.customer.company && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{campaign.customer.company}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.totalContacted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total leads contacted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Replies</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {campaign.totalReplies}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {replyRate}% reply rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {campaign.totalQualified}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {qualificationRate}% qualification rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                €{spent.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                €{remaining.toFixed(0)} remaining
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaign.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{campaign.description}</p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                <p className="font-medium">€{campaign.budget.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price per Lead</p>
                <p className="font-medium">€{campaign.pricePerLead.toFixed(0)}</p>
              </div>
              {campaign.maxLeads && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Max Leads</p>
                  <p className="font-medium">{campaign.maxLeads}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created At</p>
              <p className="font-medium">
                {new Date(campaign.createdAt).toLocaleString()}
              </p>
            </div>
            {campaign.startedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Started At</p>
                <p className="font-medium">
                  {new Date(campaign.startedAt).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Target Criteria (ICP)</CardTitle>
            <CardDescription>Ideal Customer Profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {campaign.targetCriteria.industries && campaign.targetCriteria.industries.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.targetCriteria.industries.map((industry, idx) => (
                      <Badge key={idx} variant="outline">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {campaign.targetCriteria.companySize && campaign.targetCriteria.companySize.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Company Size</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.targetCriteria.companySize.map((size, idx) => (
                      <Badge key={idx} variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {campaign.targetCriteria.locations && campaign.targetCriteria.locations.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.targetCriteria.locations.map((location, idx) => (
                      <Badge key={idx} variant="outline">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {campaign.targetCriteria.titles && campaign.targetCriteria.titles.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Job Titles</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.targetCriteria.titles.map((title, idx) => (
                      <Badge key={idx} variant="outline">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Sequences */}
        {campaign.emailSequences && campaign.emailSequences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Email Sequences ({campaign.emailSequences.length})</CardTitle>
              <CardDescription>Automated follow-up sequence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.emailSequences.map((sequence) => (
                  <div
                    key={sequence.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>Step {sequence.step}</Badge>
                        <span className="font-medium">{sequence.subject}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {sequence.delayDays} day{sequence.delayDays !== 1 ? 's' : ''} delay
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {sequence.body}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>Sent: {sequence.sent}</span>
                      <span>Opened: {sequence.opened}</span>
                      <span>Clicked: {sequence.clicked}</span>
                      <span className="text-green-600 font-medium">
                        Replied: {sequence.replied}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
