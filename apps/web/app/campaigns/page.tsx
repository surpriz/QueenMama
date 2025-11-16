'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Plus, Target } from 'lucide-react';
import { useCampaigns } from '@/hooks/use-campaigns';

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; className: string }> = {
    ACTIVE: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    PAUSED: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    DRAFT: { variant: 'outline', className: '' },
    COMPLETED: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    PENDING_REVIEW: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    WARMUP: { variant: 'secondary', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    CANCELED: { variant: 'destructive', className: '' },
  };

  return variants[status] || variants.DRAFT;
};

const formatStatus = (status: string) => {
  return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
};

const getTargetSummary = (targetCriteria: any) => {
  const parts = [];
  if (targetCriteria.industries && targetCriteria.industries.length > 0) {
    parts.push(`${targetCriteria.industries.length} ${targetCriteria.industries.length === 1 ? 'industry' : 'industries'}`);
  }
  if (targetCriteria.locations && targetCriteria.locations.length > 0) {
    parts.push(`${targetCriteria.locations.length} ${targetCriteria.locations.length === 1 ? 'location' : 'locations'}`);
  }
  if (targetCriteria.titles && targetCriteria.titles.length > 0) {
    parts.push(`${targetCriteria.titles.length} ${targetCriteria.titles.length === 1 ? 'title' : 'titles'}`);
  }
  if (targetCriteria.companySize && targetCriteria.companySize.length > 0) {
    parts.push(`${targetCriteria.companySize.length} size${targetCriteria.companySize.length === 1 ? '' : 's'}`);
  }
  return parts.length > 0 ? parts.join(', ') : 'No targeting';
};

export default function CampaignsPage() {
  const router = useRouter();
  const { data: campaigns, isLoading, error } = useCampaigns();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your lead generation campaigns
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Failed to load campaigns</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            ) : !campaigns || campaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No campaigns yet. Create your first campaign to get started!
                </p>
                <Link href="/campaigns/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sequences</TableHead>
                    <TableHead className="text-right">Contacted</TableHead>
                    <TableHead className="text-right">Qualified</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const badge = getStatusBadge(campaign.status);
                    const targetSummary = getTargetSummary(campaign.targetCriteria || {});
                    const description = campaign.description
                      ? campaign.description.length > 50
                        ? campaign.description.substring(0, 50) + '...'
                        : campaign.description
                      : '-';

                    return (
                      <TableRow
                        key={campaign.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                          {description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Target className="h-3 w-3" />
                            <span>{targetSummary}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant} className={badge.className}>
                            {formatStatus(campaign.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.emailSequences?.length || 0}
                        </TableCell>
                        <TableCell className="text-right">{campaign.totalContacted}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {campaign.totalQualified}
                        </TableCell>
                        <TableCell className="text-right">€{campaign.budget}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
