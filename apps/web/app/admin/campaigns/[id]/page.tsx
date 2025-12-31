'use client';

import { GlassCard } from '@/components/landing/GlassCard';
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
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CampaignStatus } from '@/lib/api';
import { CampaignPricingAnalyzer } from './CampaignPricingAnalyzer';
import { useQueryClient } from '@tanstack/react-query';

const getStatusBadge = (status: string) => {
  const variants: Record<string, { className: string; label: string }> = {
    DRAFT: { className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30', label: 'Brouillon' },
    PENDING_REVIEW: { className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', label: 'En attente' },
    WARMUP: { className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', label: 'Warmup' },
    ACTIVE: { className: 'bg-green-500/20 text-green-400 border border-green-500/30', label: 'Active' },
    PAUSED: { className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', label: 'En pause' },
    COMPLETED: { className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', label: 'Terminée' },
    CANCELED: { className: 'bg-red-500/20 text-red-400 border border-red-500/30', label: 'Annulée' },
  };
  return variants[status] || variants.DRAFT;
};

export default function AdminCampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: campaign, isLoading, refetch } = useAdminCampaign(id);
  const approveCampaign = useApproveCampaign();
  const rejectCampaign = useRejectCampaign();
  const updateCampaign = useUpdateAdminCampaign();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handlePricingUpdated = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
  };

  // Set initial status when campaign loads
  useEffect(() => {
    if (campaign) {
      setSelectedStatus(campaign.status);
    }
  }, [campaign]);

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campagne introuvable</h2>
          <Button
            onClick={() => router.push('/admin/campaigns')}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            Retour aux Campagnes
          </Button>
        </div>
      </div>
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

  const pricePerLead = campaign.pricePerLead ?? 0;
  const spent = campaign.totalPaid * pricePerLead;
  const remaining = campaign.budget - spent;
  const hasPricing = campaign.pricePerLead !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/campaigns')}
            className="border-white/10 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              {campaign.name}
            </h1>
            <p className="text-muted-foreground">Détails de la campagne</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Statut :</span>
            <Select
              value={selectedStatus}
              onValueChange={handleStatusChange}
              disabled={updateCampaign.isPending}
            >
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                <SelectItem value="DRAFT">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    Brouillon
                  </span>
                </SelectItem>
                <SelectItem value="PENDING_REVIEW">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    En attente
                  </span>
                </SelectItem>
                <SelectItem value="WARMUP">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Warmup
                  </span>
                </SelectItem>
                <SelectItem value="ACTIVE">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Active
                  </span>
                </SelectItem>
                <SelectItem value="PAUSED">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    En pause
                  </span>
                </SelectItem>
                <SelectItem value="COMPLETED">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Terminée
                  </span>
                </SelectItem>
                <SelectItem value="CANCELED">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Annulée
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Actions for PENDING_REVIEW */}
          {campaign.status === 'PENDING_REVIEW' && (
            <>
              <Button
                size="sm"
                onClick={handleApproveCampaign}
                disabled={approveCampaign.isPending || !hasPricing}
                title={!hasPricing ? 'Définir le prix avant d\'approuver' : undefined}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {hasPricing ? 'Approuver' : 'Prix requis'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRejectCampaign}
                disabled={rejectCampaign.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold mb-4">Informations Client</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nom</p>
              <p className="font-medium">{customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{campaign.customer.email}</p>
            </div>
          </div>
          {campaign.customer.company && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Building className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entreprise</p>
                <p className="font-medium">{campaign.customer.company}</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-6" hoverable>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Contactés</h3>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{campaign.totalContacted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total leads contactés
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverable>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Réponses</h3>
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Mail className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-cyan-400">
              {campaign.totalReplies}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {replyRate}% taux de réponse
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverable glowColor="green">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Qualifiés</h3>
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-400">
              {campaign.totalQualified}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {qualificationRate}% taux de qualification
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverable glowColor="purple">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Revenus</h3>
            <div className="p-2 rounded-lg bg-purple-500/20">
              <DollarSign className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-purple-400">
              {spent.toFixed(0)}€
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {remaining.toFixed(0)}€ restants
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Pricing Analyzer - Show prominently for campaigns needing pricing */}
      <CampaignPricingAnalyzer
        campaign={campaign}
        onPricingUpdated={handlePricingUpdated}
      />

      {/* Campaign Details */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold mb-4">Détails de la Campagne</h2>
        <div className="space-y-4">
          {campaign.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p>{campaign.description}</p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Budget</p>
              <p className="font-medium">{campaign.budget.toFixed(0)}€</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Prix par Lead</p>
              <p className="font-medium">
                {campaign.pricePerLead !== null ? (
                  `${campaign.pricePerLead.toFixed(0)}€`
                ) : (
                  <span className="text-orange-400">Non défini</span>
                )}
              </p>
            </div>
            {campaign.maxLeads && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Max Leads</p>
                <p className="font-medium">{campaign.maxLeads}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Créée le</p>
            <p className="font-medium">
              {new Date(campaign.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>
          {campaign.startedAt && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Démarrée le</p>
              <p className="font-medium">
                {new Date(campaign.startedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Target Criteria */}
      <GlassCard className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Critères de Ciblage (ICP)</h2>
          <p className="text-sm text-muted-foreground">Profil Client Idéal</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {campaign.targetCriteria.industries && campaign.targetCriteria.industries.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Secteurs</p>
              <div className="flex flex-wrap gap-2">
                {campaign.targetCriteria.industries.map((industry, idx) => (
                  <Badge key={idx} className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {campaign.targetCriteria.companySize && campaign.targetCriteria.companySize.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taille entreprise</p>
              <div className="flex flex-wrap gap-2">
                {campaign.targetCriteria.companySize.map((size, idx) => (
                  <Badge key={idx} className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {campaign.targetCriteria.locations && campaign.targetCriteria.locations.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Localisations</p>
              <div className="flex flex-wrap gap-2">
                {campaign.targetCriteria.locations.map((location, idx) => (
                  <Badge key={idx} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {campaign.targetCriteria.titles && campaign.targetCriteria.titles.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Postes ciblés</p>
              <div className="flex flex-wrap gap-2">
                {campaign.targetCriteria.titles.map((title, idx) => (
                  <Badge key={idx} className="bg-green-500/20 text-green-400 border border-green-500/30">
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Email Sequences */}
      {campaign.emailSequences && campaign.emailSequences.length > 0 && (
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Séquences Email ({campaign.emailSequences.length})</h2>
            <p className="text-sm text-muted-foreground">Séquence de relance automatique</p>
          </div>
          <div className="space-y-4">
            {campaign.emailSequences.map((sequence) => (
              <div
                key={sequence.id}
                className="border border-white/10 rounded-xl p-4 space-y-2 bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Étape {sequence.step}
                    </Badge>
                    <span className="font-medium">{sequence.subject}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {sequence.delayDays} jour{sequence.delayDays !== 1 ? 's' : ''} de délai
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {sequence.body}
                </p>
                <div className="flex gap-4 text-sm">
                  <span>Envoyés : {sequence.sent}</span>
                  <span>Ouverts : {sequence.opened}</span>
                  <span>Cliqués : {sequence.clicked}</span>
                  <span className="text-green-400 font-medium">
                    Réponses : {sequence.replied}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
