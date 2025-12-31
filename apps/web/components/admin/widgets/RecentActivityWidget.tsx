'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { useRecentActivity } from '@/hooks/use-admin';
import { ActivityType } from '@/lib/api';
import {
  Activity,
  Loader2,
  Target,
  Check,
  X,
  Users,
  Euro,
  CreditCard,
} from 'lucide-react';

const getActivityConfig = (type: ActivityType) => {
  const configs: Record<ActivityType, { icon: any; color: string; bgColor: string }> = {
    campaign_created: {
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    campaign_approved: {
      icon: Check,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    campaign_rejected: {
      icon: X,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    lead_qualified: {
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    lead_paid: {
      icon: Euro,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    payment_received: {
      icon: CreditCard,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
  };
  return configs[type] || configs.campaign_created;
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
};

export function RecentActivityWidget() {
  const { data: activities, isLoading, isError } = useRecentActivity(10);

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

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Activity className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Activité Récente</h2>
          <p className="text-sm text-muted-foreground">
            Dernières actions sur la plateforme
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-4">
          {!activities || activities.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Aucune activité récente
            </div>
          ) : (
            activities.map((activity, index) => {
              const config = getActivityConfig(activity.type);
              const Icon = config.icon;

              return (
                <div key={activity.id} className="relative flex items-start gap-4 pl-8">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} border-2 border-background`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(activity.timestamp)}
                      {activity.metadata.amount && (
                        <span className="ml-2 text-green-400">
                          +{new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0,
                          }).format(activity.metadata.amount)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </GlassCard>
  );
}
