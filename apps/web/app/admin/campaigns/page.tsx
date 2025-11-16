'use client';

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
import { Target, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  useAdminCampaigns,
  useApproveCampaign,
  useRejectCampaign,
} from '@/hooks/use-admin';
import { AdminCampaign } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export default function AdminCampaignsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const approveCampaign = useApproveCampaign();
  const rejectCampaign = useRejectCampaign();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleApproveCampaign = async (id: string) => {
    if (confirm('Approve this campaign? It will become ACTIVE and start running.')) {
      try {
        await approveCampaign.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to approve campaign');
      }
    }
  };

  const handleRejectCampaign = async (id: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      // User didn't cancel
      try {
        await rejectCampaign.mutateAsync({ id, reason: reason || undefined });
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to reject campaign');
      }
    }
  };

  // Filter campaigns by status
  const filteredCampaigns = campaigns?.filter((campaign) => {
    if (statusFilter === 'ALL') return true;
    return campaign.status === statusFilter;
  });

  // Count campaigns by status
  const statusCounts = campaigns?.reduce((acc, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1>
          <p className="text-muted-foreground">
            Review and manage all campaigns from all customers
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
          >
            All ({campaigns?.length || 0})
          </Button>
          <Button
            variant={statusFilter === 'PENDING_REVIEW' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('PENDING_REVIEW')}
          >
            Pending Review ({statusCounts['PENDING_REVIEW'] || 0})
          </Button>
          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Active ({statusCounts['ACTIVE'] || 0})
          </Button>
          <Button
            variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('DRAFT')}
          >
            Draft ({statusCounts['DRAFT'] || 0})
          </Button>
          <Button
            variant={statusFilter === 'PAUSED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('PAUSED')}
          >
            Paused ({statusCounts['PAUSED'] || 0})
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completed ({statusCounts['COMPLETED'] || 0})
          </Button>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredCampaigns || filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {statusFilter === 'ALL'
                    ? 'No campaigns found'
                    : `No ${statusFilter.toLowerCase()} campaigns`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Contacted</TableHead>
                      <TableHead>Qualified</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign: AdminCampaign) => {
                      const statusBadge = getStatusBadge(campaign.status);
                      const customerName =
                        campaign.customer.firstName && campaign.customer.lastName
                          ? `${campaign.customer.firstName} ${campaign.customer.lastName}`
                          : campaign.customer.email;

                      return (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{campaign.name}</div>
                              {campaign.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {campaign.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{customerName}</div>
                              {campaign.customer.company && (
                                <div className="text-xs text-muted-foreground">
                                  {campaign.customer.company}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadge.className}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>€{campaign.budget.toFixed(0)}</TableCell>
                          <TableCell>{campaign.totalContacted}</TableCell>
                          <TableCell>
                            <span className="text-green-600 font-medium">
                              {campaign.totalQualified}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {campaign.status === 'PENDING_REVIEW' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApproveCampaign(campaign.id)}
                                    disabled={approveCampaign.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectCampaign(campaign.id)}
                                    disabled={rejectCampaign.isPending}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
