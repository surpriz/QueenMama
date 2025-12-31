'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/landing/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, UserCheck, Ban, Shield, Loader2, Search } from 'lucide-react';
import {
  useAdminStats,
  useAdminUsers,
  useBlockUser,
  useUnblockUser,
  useDemoteUser,
  useDeleteUser,
  usePromoteUser,
} from '@/hooks/use-admin';
import { AdminUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

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

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const demoteUser = useDemoteUser();
  const deleteUser = useDeleteUser();
  const promoteUser = usePromoteUser();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const handleBlockUser = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir bloquer cet utilisateur ?')) {
      await blockUser.mutateAsync(id);
    }
  };

  const handleUnblockUser = async (id: string) => {
    await unblockUser.mutateAsync(id);
  };

  const handleDemoteUser = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer les droits admin de cet utilisateur ?')) {
      await demoteUser.mutateAsync(id);
    }
  };

  const handlePromoteUser = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir promouvoir cet utilisateur en admin ?')) {
      await promoteUser.mutateAsync(id);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      await deleteUser.mutateAsync(id);
    }
  };

  // Filter users
  const filteredUsers = users?.filter((u: AdminUser) => {
    const matchesSearch =
      searchQuery === '' ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Gestion des Utilisateurs
        </h1>
        <p className="text-muted-foreground">
          Gérez les utilisateurs de la plateforme
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-6" hoverable glowColor="purple">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Utilisateurs</h3>
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
            <h3 className="text-sm font-medium text-muted-foreground">Utilisateurs Actifs</h3>
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
            <h3 className="text-sm font-medium text-muted-foreground">Utilisateurs Bloqués</h3>
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
            <h3 className="text-sm font-medium text-muted-foreground">Administrateurs</h3>
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
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou entreprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              <SelectItem value="ALL">Tous les status</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="BLOCKED">Bloqué</SelectItem>
              <SelectItem value="DELETED">Supprimé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              <SelectItem value="ALL">Tous les rôles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">Utilisateur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Liste des Utilisateurs</h2>
            <p className="text-sm text-muted-foreground">
              {filteredUsers?.length || 0} utilisateur(s) trouvé(s)
            </p>
          </div>
        </div>
        {usersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : !filteredUsers || filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-muted-foreground">Utilisateur</TableHead>
                  <TableHead className="text-muted-foreground">Entreprise</TableHead>
                  <TableHead className="text-muted-foreground">Inscrit le</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Rôle</TableHead>
                  <TableHead className="text-muted-foreground">Campagnes</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u: AdminUser) => {
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
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadge.className}>
                          {u.status === 'ACTIVE' ? 'Actif' : u.status === 'BLOCKED' ? 'Bloqué' : 'Supprimé'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleBadge.className}>
                          {u.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
                        </Badge>
                      </TableCell>
                      <TableCell>{u._count.campaigns}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                onClick={() => handlePromoteUser(u.id)}
                                disabled={promoteUser.isPending}
                              >
                                Promouvoir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 hover:bg-white/5"
                                onClick={() => handleBlockUser(u.id)}
                                disabled={blockUser.isPending}
                              >
                                Bloquer
                              </Button>
                            </>
                          )}
                          {u.status === 'BLOCKED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              onClick={() => handleUnblockUser(u.id)}
                              disabled={unblockUser.isPending}
                            >
                              Débloquer
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
                              Rétrograder
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
                              Supprimer
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
  );
}
