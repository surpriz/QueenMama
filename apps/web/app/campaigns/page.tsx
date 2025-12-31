'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { GlassCard } from '@/components/landing/GlassCard';
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
import { Plus, Target, Loader2 } from 'lucide-react';
import { useCampaigns } from '@/hooks/use-campaigns';

const getStatusBadge = (status: string) => {
  const variants: Record<string, { className: string }> = {
    ACTIVE: { className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    PAUSED: { className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
    DRAFT: { className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
    COMPLETED: { className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    PENDING_REVIEW: { className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    WARMUP: { className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
    CANCELED: { className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
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
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Campaigns
            </h1>
            <p className="text-muted-foreground">
              Manage your lead generation campaigns
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-glow-sm hover:shadow-glow-md transition-all">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>

        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">All Campaigns</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">Failed to load campaigns</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          ) : !campaigns || campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 inline-block mb-4">
                <Target className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first campaign to get started!
              </p>
              <Link href="/campaigns/new">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Target</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Sequences</TableHead>
                    <TableHead className="text-right text-muted-foreground">Contacted</TableHead>
                    <TableHead className="text-right text-muted-foreground">Qualified</TableHead>
                    <TableHead className="text-right text-muted-foreground">Budget</TableHead>
                    <TableHead className="text-right text-muted-foreground">Prix/lead</TableHead>
                    <TableHead className="text-muted-foreground">Created</TableHead>
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
                        className="cursor-pointer border-white/10 hover:bg-white/5 transition-colors"
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
                          <Badge className={badge.className}>
                            {formatStatus(campaign.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.emailSequences?.length || 0}
                        </TableCell>
                        <TableCell className="text-right">{campaign.totalContacted}</TableCell>
                        <TableCell className="text-right text-green-400 font-medium">
                          {campaign.totalQualified}
                        </TableCell>
                        <TableCell className="text-right">€{campaign.budget}</TableCell>
                        <TableCell className="text-right">
                          {campaign.pricePerLead !== null ? (
                            <span className="font-medium">
                              €{Number.isInteger(campaign.pricePerLead)
                                ? campaign.pricePerLead
                                : campaign.pricePerLead.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-orange-400 italic text-sm">
                              En attente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
