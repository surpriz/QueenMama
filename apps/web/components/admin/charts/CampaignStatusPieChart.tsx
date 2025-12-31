'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { useCampaignDistribution } from '@/hooks/use-admin';
import { Target, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function CampaignStatusPieChart() {
  const { data: distribution, isLoading, isError, refetch } = useCampaignDistribution();

  if (isLoading) {
    return (
      <GlassCard className="p-6 h-[400px]">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </GlassCard>
    );
  }

  if (isError || !distribution) {
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

  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  // Custom legend renderer
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
            <span className="font-medium">({entry.payload.count})</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
          <Target className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Campagnes par Statut</h2>
          <p className="text-sm text-muted-foreground">
            {total} campagne{total !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        {distribution.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Aucune campagne
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="label"
              >
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => {
                  const percentage = ((value / total) * 100).toFixed(1);
                  return [`${value} (${percentage}%)`, name];
                }}
              />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}
