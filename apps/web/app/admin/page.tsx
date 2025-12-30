'use client';

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
import { Users, UserCheck, Ban, Shield, Target, Loader2 } from 'lucide-react';
import { useAdminStats, useAdminUsers, useAdminCampaigns, useBlockUser, useUnblockUser, useDemoteUser, useDeleteUser } from '@/hooks/use-admin';
import { AdminUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SESMonitoringWidget } from '@/components/admin/SESMonitoringWidget';

const getStatusBadge = (status: string) => {
  const variants: Record<string, { className: string }> = {
    ACTIVE: { className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    BLOCKED: { className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    DELETED: { className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
  };
  return variants[status] || variants.ACTIVE;
};

const getRoleBadge = (role: string) => {
  const variants: Record<string, { className: string }> = {
    ADMIN: { className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    USER: { className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  };
  return variants[role] || variants.USER;
};

const getCampaignStatusBadge = (status: string) => {
  const variants: Record<string, { className: string }> = {
    DRAFT: { className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
    PENDING_REVIEW: { className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
    WARMUP: { className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    ACTIVE: { className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    PAUSED: { className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
    COMPLETED: { className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    CANCELED: { className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  };
  return variants[status] || variants.DRAFT;
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: campaigns } = useAdminCampaigns();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const demoteUser = useDemoteUser();
  const deleteUser = useDeleteUser();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleBlockUser = async (id: string) => {
    if (confirm('Are you sure you want to block this user?')) {
      await blockUser.mutateAsync(id);
    }
  };

  const handleUnblockUser = async (id: string) => {
    await unblockUser.mutateAsync(id);
  };

  const handleDemoteUser = async (id: string) => {
    if (confirm('Are you sure you want to demote this admin?')) {
      await demoteUser.mutateAsync(id);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser.mutateAsync(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage users and view system statistics
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <GlassCard className="p-6" hoverable glowColor="purple">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalUsers || 0}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6" hoverable glowColor="green">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
              <div className="p-2 rounded-lg bg-green-500/20">
                <UserCheck className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-400">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.activeUsers || 0}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6" hoverable>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Blocked Users</h3>
              <div className="p-2 rounded-lg bg-red-500/20">
                <Ban className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-red-400">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.blockedUsers || 0}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6" hoverable glowColor="purple">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Administrators</h3>
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Shield className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-purple-400">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.admins || 0}
              </div>
            </div>
          </GlassCard>

          <GlassCard
            className="p-6 cursor-pointer"
            hoverable
            glowColor="blue"
            onClick={() => router.push('/admin/campaigns')}
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Campaigns</h3>
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-400">
                {campaigns?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {campaigns?.filter((c) => c.status === 'PENDING_REVIEW').length || 0} pending review
              </p>
            </div>
          </GlassCard>
        </div>

        {/* AWS SES Monitoring Widget */}
        <SESMonitoringWidget />

        {/* Recent Campaigns Widget */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent Campaigns</h2>
            <p className="text-sm text-muted-foreground">Latest campaigns across all customers</p>
          </div>
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No campaigns found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.slice(0, 5).map((campaign) => {
                const statusBadge = getCampaignStatusBadge(campaign.status);
                const customerName =
                  campaign.customer.firstName && campaign.customer.lastName
                    ? `${campaign.customer.firstName} ${campaign.customer.lastName}`
                    : campaign.customer.email;

                return (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{customerName}</p>
                        </div>
                        <Badge className={statusBadge.className}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{campaign._count.leads} leads</p>
                        <p className="text-xs text-green-400">{campaign.totalQualified} qualified</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 hover:bg-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/campaigns/${campaign.id}`);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
              {campaigns.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5"
                  onClick={() => router.push('/admin/campaigns')}
                >
                  View All Campaigns ({campaigns.length})
                </Button>
              )}
            </div>
          )}
        </GlassCard>

        {/* Users Table */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">All Users</h2>
          </div>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Company</TableHead>
                    <TableHead className="text-muted-foreground">Created At</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground">Campaigns</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: AdminUser) => {
                    const statusBadge = getStatusBadge(u.status);
                    const roleBadge = getRoleBadge(u.role);

                    return (
                      <TableRow key={u.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {u.firstName && u.lastName
                                ? `${u.firstName} ${u.lastName}`
                                : u.email}
                            </div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{u.company || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.className}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleBadge.className}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{u._count.campaigns}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 hover:bg-white/5"
                                onClick={() => handleBlockUser(u.id)}
                                disabled={blockUser.isPending}
                              >
                                Block
                              </Button>
                            )}
                            {u.status === 'BLOCKED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 hover:bg-white/5"
                                onClick={() => handleUnblockUser(u.id)}
                                disabled={unblockUser.isPending}
                              >
                                Unblock
                              </Button>
                            )}
                            {u.role === 'ADMIN' && u.id !== user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 hover:bg-white/5"
                                onClick={() => handleDemoteUser(u.id)}
                                disabled={demoteUser.isPending}
                              >
                                Demote
                              </Button>
                            )}
                            {u.role !== 'ADMIN' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={deleteUser.isPending}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
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
