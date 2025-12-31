'use client';

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
import { Users, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { useAdminLeads, useDeleteLead } from '@/hooks/use-admin';
import { Lead, LeadStatus } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const getStatusBadge = (status: LeadStatus) => {
  const variants: Record<LeadStatus, { className: string; label: string }> = {
    CONTACTED: { className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', label: 'Contacté' },
    OPENED: { className: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30', label: 'Ouvert' },
    REPLIED: { className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', label: 'Répondu' },
    INTERESTED: { className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', label: 'Intéressé' },
    QUALIFIED: { className: 'bg-green-500/20 text-green-400 border border-green-500/30', label: 'Qualifié' },
    PAID: { className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', label: 'Payé' },
    NOT_INTERESTED: { className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30', label: 'Non intéressé' },
    BOUNCED: { className: 'bg-red-500/20 text-red-400 border border-red-500/30', label: 'Bounced' },
    UNSUBSCRIBED: { className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', label: 'Désinscrit' },
  };
  return variants[status];
};

const getSentimentBadge = (sentiment?: string) => {
  if (!sentiment) return null;
  const variants: Record<string, { className: string; label: string }> = {
    POSITIVE: { className: 'bg-green-500/20 text-green-400 border border-green-500/30', label: '😊 Positif' },
    NEUTRAL: { className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30', label: '😐 Neutre' },
    NEGATIVE: { className: 'bg-red-500/20 text-red-400 border border-red-500/30', label: '😞 Négatif' },
  };
  return variants[sentiment];
};

export default function AdminLeadsPage() {
  const router = useRouter();
  const { data: leads, isLoading } = useAdminLeads();
  const deleteLead = useDeleteLead();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleDeleteLead = async (id: string, leadName: string) => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer le lead "${leadName}" ? Cette action est irréversible.`
      )
    ) {
      try {
        await deleteLead.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erreur lors de la suppression');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Gestion des Leads
          </h1>
          <p className="text-muted-foreground">
            Ajouter et gérer manuellement les leads des campagnes
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/leads/new')}
          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Lead
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('ALL')}
          className={statusFilter === 'ALL' ? 'bg-purple-600 hover:bg-purple-700' : 'border-white/10 hover:bg-white/5'}
        >
          Tous ({leads?.length || 0})
        </Button>
        <Button
          variant={statusFilter === 'QUALIFIED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('QUALIFIED')}
          className={statusFilter === 'QUALIFIED' ? 'bg-green-600 hover:bg-green-700' : 'border-white/10 hover:bg-white/5'}
        >
          Qualifiés ({statusCounts['QUALIFIED'] || 0})
        </Button>
        <Button
          variant={statusFilter === 'INTERESTED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('INTERESTED')}
          className={statusFilter === 'INTERESTED' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-white/10 hover:bg-white/5'}
        >
          Intéressés ({statusCounts['INTERESTED'] || 0})
        </Button>
        <Button
          variant={statusFilter === 'REPLIED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('REPLIED')}
          className={statusFilter === 'REPLIED' ? 'bg-purple-600 hover:bg-purple-700' : 'border-white/10 hover:bg-white/5'}
        >
          Répondus ({statusCounts['REPLIED'] || 0})
        </Button>
        <Button
          variant={statusFilter === 'PAID' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('PAID')}
          className={statusFilter === 'PAID' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-white/10 hover:bg-white/5'}
        >
          Payés ({statusCounts['PAID'] || 0})
        </Button>
      </div>

      {/* Leads Table */}
      <GlassCard className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : !filteredLeads || filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {statusFilter === 'ALL'
                ? 'Aucun lead trouvé. Ajoutez votre premier lead !'
                : `Aucun lead ${statusFilter.toLowerCase()}`}
            </p>
            <Button
              onClick={() => router.push('/admin/leads/new')}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Lead
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-muted-foreground">Nom</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Entreprise</TableHead>
                  <TableHead className="text-muted-foreground">Campagne</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Sentiment</TableHead>
                  <TableHead className="text-muted-foreground">Qualité</TableHead>
                  <TableHead className="text-muted-foreground">Créé le</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead: Lead) => {
                  const statusBadge = getStatusBadge(lead.status);
                  const sentimentBadge = getSentimentBadge(lead.sentiment);
                  const leadName = `${lead.firstName} ${lead.lastName}`;

                  return (
                    <TableRow key={lead.id} className="border-white/10 hover:bg-white/5">
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
                          {statusBadge.label}
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
                            <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-green-500"
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
                      <TableCell className="text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 hover:bg-white/5"
                            onClick={() =>
                              alert('Fonctionnalité en cours de développement')
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
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
      </GlassCard>
    </div>
  );
}
