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
import { Users, UserCheck, Ban, Shield } from 'lucide-react';
import { useAdminStats, useAdminUsers, useBlockUser, useUnblockUser, useDemoteUser, useDeleteUser } from '@/hooks/use-admin';
import { AdminUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const getStatusBadge = (status: string) => {
  const variants: Record<string, { className: string }> = {
    ACTIVE: { className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    BLOCKED: { className: 'bg-red-100 text-red-700 hover:bg-red-200' },
    DELETED: { className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  };
  return variants[status] || variants.ACTIVE;
};

const getRoleBadge = (role: string) => {
  const variants: Record<string, { className: string }> = {
    ADMIN: { className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    USER: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  };
  return variants[role] || variants.USER;
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users and view system statistics
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : stats?.activeUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statsLoading ? '...' : stats?.blockedUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statsLoading ? '...' : stats?.admins || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Campaigns</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: AdminUser) => {
                      const statusBadge = getStatusBadge(u.status);
                      const roleBadge = getRoleBadge(u.role);

                      return (
                        <TableRow key={u.id}>
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
                          <TableCell>
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
                                  onClick={() => handleDemoteUser(u.id)}
                                  disabled={demoteUser.isPending}
                                >
                                  Demote
                                </Button>
                              )}
                              {u.role !== 'ADMIN' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
