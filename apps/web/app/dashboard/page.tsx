'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { GlassCard } from '@/components/landing/GlassCard';
import { Target, Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-campaigns';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-destructive">Error loading dashboard stats</p>
        </div>
      </DashboardLayout>
    );
  }

  const dashboardCards = [
    {
      title: 'Total Campaigns',
      value: stats?.totalCampaigns.toString() || '0',
      description: `${stats?.totalCampaigns || 0} campaign${stats?.totalCampaigns !== 1 ? 's' : ''} created`,
      icon: Target,
      trend: stats?.totalCampaignsGrowth || '0%',
      color: 'purple' as const,
    },
    {
      title: 'Active Leads',
      value: stats?.activeLeads.toString() || '0',
      description: 'Contacted and engaged',
      icon: Users,
      trend: stats?.activeLeadsGrowth || '0%',
      color: 'blue' as const,
    },
    {
      title: 'Qualified Leads',
      value: stats?.qualifiedLeads.toString() || '0',
      description: 'Ready to unlock',
      icon: TrendingUp,
      trend: stats?.qualifiedLeadsGrowth || '0%',
      color: 'green' as const,
    },
    {
      title: 'Revenue',
      value: `€${stats?.revenue.toFixed(2) || '0.00'}`,
      description: 'This month',
      icon: DollarSign,
      trend: stats?.revenueGrowth || '0%',
      color: 'purple' as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your lead generation performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <GlassCard key={card.title} className="p-6" hoverable glowColor={card.color}>
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                  <div className={`p-2 rounded-lg ${
                    card.color === 'purple' ? 'bg-purple-500/20' :
                    card.color === 'blue' ? 'bg-blue-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      card.color === 'purple' ? 'text-purple-400' :
                      card.color === 'blue' ? 'text-blue-400' :
                      'text-green-400'
                    }`} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {card.trend}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Recent Campaigns */}
        {stats?.recentCampaigns && stats.recentCampaigns.length > 0 && (
          <GlassCard className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Recent Campaigns</h2>
              <p className="text-sm text-muted-foreground">Your latest lead generation campaigns</p>
            </div>
            <div className="space-y-3">
              {stats.recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{campaign.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{campaign.leads} leads</span>
                      <span className="text-green-400">{campaign.qualified} qualified</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        campaign.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : campaign.status === 'DRAFT'
                          ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          : campaign.status === 'PAUSED'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Empty State */}
        {stats?.recentCampaigns && stats.recentCampaigns.length === 0 && (
          <GlassCard className="p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4">
                <Target className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first campaign to start generating qualified leads for your business
              </p>
              <Link
                href="/campaigns/new"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-blue-500 transition-all shadow-glow-sm hover:shadow-glow-md"
              >
                Create Campaign
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
}
