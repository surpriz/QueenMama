'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { Button } from '@/components/ui/button';
import { useRevenueStats } from '@/hooks/use-admin';
import { Euro, TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(value);
};

export function RevenueChart() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const { data: stats, isLoading, isError, refetch, isFetching } = useRevenueStats(period);

  if (isLoading) {
    return (
      <GlassCard className="p-6 h-[400px]">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </GlassCard>
    );
  }

  if (isError || !stats) {
    return (
      <GlassCard className="p-6 h-[400px]">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-muted-foreground">Erreur de chargement des revenus</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/10 hover:bg-white/5">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </GlassCard>
    );
  }

  const isPositiveGrowth = stats.growth >= 0;

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Euro className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Revenus</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatCurrency(stats.total)}</span>
              <div className={`flex items-center gap-1 text-sm ${isPositiveGrowth ? 'text-green-400' : 'text-red-400'}`}>
                {isPositiveGrowth ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{isPositiveGrowth ? '+' : ''}{stats.growth.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          <Button
            variant={period === 'weekly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPeriod('weekly')}
            disabled={isFetching}
            className={period === 'weekly'
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'hover:bg-white/10'}
          >
            Semaine
          </Button>
          <Button
            variant={period === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPeriod('monthly')}
            disabled={isFetching}
            className={period === 'monthly'
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'hover:bg-white/10'}
          >
            Mois
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        {stats.data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="period"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return [formatCurrency(value), 'Revenus'];
                  if (name === 'leadsCount') return [value, 'Leads'];
                  return [value, name];
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
}
