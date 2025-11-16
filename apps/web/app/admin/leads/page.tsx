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
import { Users, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { useAdminLeads, useDeleteLead } from '@/hooks/use-admin';
import { Lead, LeadStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const getStatusBadge = (status: LeadStatus) => {
  const variants: Record<LeadStatus, { className: string }> = {
    CONTACTED: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    OPENED: { className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' },
    REPLIED: { className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    INTERESTED: { className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    QUALIFIED: { className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    PAID: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
    NOT_INTERESTED: { className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    BOUNCED: { className: 'bg-red-100 text-red-700 hover:bg-red-200' },
    UNSUBSCRIBED: { className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  };
  return variants[status];
};

const getSentimentBadge = (sentiment?: string) => {
  if (!sentiment) return null;
  const variants: Record<string, { className: string; label: string }> = {
    POSITIVE: { className: 'bg-green-100 text-green-700', label: '😊 Positive' },
    NEUTRAL: { className: 'bg-gray-100 text-gray-700', label: '😐 Neutral' },
    NEGATIVE: { className: 'bg-red-100 text-red-700', label: '😞 Negative' },
  };
  return variants[sentiment];
};

export default function AdminLeadsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: leads, isLoading } = useAdminLeads();
  const deleteLead = useDeleteLead();
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

  const handleDeleteLead = async (id: string, leadName: string) => {
    if (
      confirm(
        `Are you sure you want to delete lead "${leadName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteLead.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete lead');
      }
    }
  };

  // Filter leads by status
  const filteredLeads = leads?.filter((lead) => {
    if (statusFilter === 'ALL') return true;
    return lead.status === statusFilter;
  });

  // Count leads by status
  const statusCounts =
    leads?.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
            <p className="text-muted-foreground">
              Manually add and manage leads across all campaigns
            </p>
          </div>
          <Button onClick={() => router.push('/admin/leads/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
          >
            All ({leads?.length || 0})
          </Button>
          <Button
            variant={statusFilter === 'QUALIFIED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('QUALIFIED')}
          >
            Qualified ({statusCounts['QUALIFIED'] || 0})
          </Button>
          <Button
            variant={statusFilter === 'INTERESTED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('INTERESTED')}
          >
            Interested ({statusCounts['INTERESTED'] || 0})
          </Button>
          <Button
            variant={statusFilter === 'REPLIED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('REPLIED')}
          >
            Replied ({statusCounts['REPLIED'] || 0})
          </Button>
          <Button
            variant={statusFilter === 'PAID' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('PAID')}
          >
            Paid ({statusCounts['PAID'] || 0})
          </Button>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredLeads || filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {statusFilter === 'ALL'
                    ? 'No leads found. Add your first lead!'
                    : `No ${statusFilter.toLowerCase()} leads`}
                </p>
                <Button onClick={() => router.push('/admin/leads/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Lead
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead: Lead) => {
                      const statusBadge = getStatusBadge(lead.status);
                      const sentimentBadge = getSentimentBadge(lead.sentiment);
                      const leadName = `${lead.firstName} ${lead.lastName}`;

                      return (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{leadName}</div>
                              {lead.title && (
                                <div className="text-sm text-muted-foreground">
                                  {lead.title}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {lead.email}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{lead.company}</div>
                              {lead.location && (
                                <div className="text-xs text-muted-foreground">
                                  {lead.location}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {/* @ts-ignore */}
                            {lead.campaign?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadge.className}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sentimentBadge ? (
                              <Badge className={sentimentBadge.className}>
                                {sentimentBadge.label}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.qualityScore !== null &&
                            lead.qualityScore !== undefined ? (
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${lead.qualityScore}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {lead.qualityScore}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  alert('Edit functionality coming soon')
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteLead(lead.id, leadName)}
                                disabled={deleteLead.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
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
