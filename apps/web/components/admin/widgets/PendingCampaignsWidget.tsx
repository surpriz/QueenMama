'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePendingCampaigns } from '@/hooks/use-admin-notifications';
import { useApproveCampaign, useRejectCampaign } from '@/hooks/use-admin';
import { Clock, Check, X, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PendingCampaignsWidget() {
  const router = useRouter();
  const { data: campaigns, isLoading, isError } = usePendingCampaigns();
  const approveCampaign = useApproveCampaign();
  const rejectCampaign = useRejectCampaign();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveCampaign.mutateAsync(id);
    } catch (error) {
      console.error('Failed to approve campaign:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Raison du rejet (optionnel):');
    setProcessingId(id);
    try {
      await rejectCampaign.mutateAsync({ id, reason: reason || undefined });
    } catch (error) {
      console.error('Failed to reject campaign:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6 h-[400px]">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </GlassCard>
    );
  }

  if (isError) {
    return (
      <GlassCard className="p-6 h-[400px]">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Erreur de chargement
        </div>
      </GlassCard>
    );
  }

  const displayedCampaigns = campaigns?.slice(0, 5) || [];
  const hasMore = (campaigns?.length || 0) > 5;

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Campagnes en Attente</h2>
            <p className="text-sm text-muted-foreground">
              {campaigns?.length || 0} campagne{(campaigns?.length || 0) !== 1 ? 's' : ''} à valider
            </p>
          </div>
        </div>
        {campaigns && campaigns.length > 0 && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
            Action requise
          </Badge>
        )}
      </div>

      {/* Campaigns List */}
      <div className="space-y-3">
        {displayedCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Check className="h-12 w-12 mb-2 text-green-400" />
            <p>Aucune campagne en attente</p>
          </div>
        ) : (
          displayedCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {campaign.customer.firstName} {campaign.customer.lastName} - {campaign.customer.company || campaign.customer.email}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{formatCurrency(campaign.budget)}</span>
                    <span>•</span>
                    <span>{formatDate(campaign.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5"
                    onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    onClick={() => handleApprove(campaign.id)}
                    disabled={processingId === campaign.id}
                  >
                    {processingId === campaign.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleReject(campaign.id)}
                    disabled={processingId === campaign.id}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {hasMore && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full hover:bg-white/5"
            onClick={() => router.push('/admin/campaigns?status=PENDING_REVIEW')}
          >
            Voir toutes les campagnes en attente
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
