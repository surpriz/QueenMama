'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { useLeadFunnelStats } from '@/hooks/use-admin';
import { Users, Loader2, RefreshCw, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunnelStep {
  name: string;
  count: number;
  color: string;
  conversionRate?: number;
}

export function LeadFunnelChart() {
  const { data: funnel, isLoading, isError, refetch } = useLeadFunnelStats();

  if (isLoading) {
    return (
      <GlassCard className="p-6 h-[400px]">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </GlassCard>
    );
  }

  if (isError || !funnel) {
    return (
      <GlassCard className="p-6 h-[400px]">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-muted-foreground">Erreur de chargement</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10 hover:bg-white/5">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </GlassCard>
    );
  }

  const steps: FunnelStep[] = [
    { name: 'Contactés', count: funnel.contacted, color: '#3b82f6' },
    { name: 'Ouverts', count: funnel.opened, color: '#06b6d4', conversionRate: funnel.conversionRates.openRate },
    { name: 'Répondus', count: funnel.replied, color: '#a855f7', conversionRate: funnel.conversionRates.replyRate },
    { name: 'Intéressés', count: funnel.interested, color: '#eab308', conversionRate: funnel.conversionRates.interestRate },
    { name: 'Qualifiés', count: funnel.qualified, color: '#22c55e', conversionRate: funnel.conversionRates.qualificationRate },
    { name: 'Payés', count: funnel.paid, color: '#10b981', conversionRate: funnel.conversionRates.paymentRate },
  ];

  const maxCount = Math.max(...steps.map(s => s.count), 1);
  const totalLeads = funnel.contacted;

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-green-500/20">
          <Users className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Funnel de Conversion</h2>
          <p className="text-sm text-muted-foreground">
            {totalLeads} lead{totalLeads !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Funnel */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const widthPercent = (step.count / maxCount) * 100;
          const previousStep = index > 0 ? steps[index - 1] : null;

          return (
            <div key={step.name}>
              {/* Conversion arrow */}
              {previousStep && step.conversionRate !== undefined && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {step.conversionRate.toFixed(1)}% de conversion
                  </span>
                </div>
              )}

              {/* Funnel bar */}
              <div className="flex items-center gap-4">
                <div className="w-24 text-right">
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden border border-white/10 relative">
                  <div
                    className="h-full transition-all duration-500 rounded-lg"
                    style={{
                      width: `${Math.max(widthPercent, 5)}%`,
                      background: `linear-gradient(90deg, ${step.color}40, ${step.color}80)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{step.count}</span>
                  </div>
                </div>
                <div className="w-16 text-left">
                  <span className="text-sm text-muted-foreground">
                    {totalLeads > 0 ? ((step.count / totalLeads) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-2xl font-bold text-cyan-400">
            {funnel.conversionRates.replyRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">Taux de réponse</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-2xl font-bold text-green-400">
            {totalLeads > 0 ? ((funnel.paid / totalLeads) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-muted-foreground">Taux de conversion final</p>
        </div>
      </div>
    </GlassCard>
  );
}
