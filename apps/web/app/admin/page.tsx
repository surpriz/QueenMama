'use client';

import { GlassCard } from '@/components/landing/GlassCard';
import { Users, UserCheck, Target, Loader2, DollarSign, Clock } from 'lucide-react';
import { useAdminStats, useAdminCampaigns } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { SESMonitoringWidget } from '@/components/admin/SESMonitoringWidget';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { CampaignStatusPieChart } from '@/components/admin/charts/CampaignStatusPieChart';
import { LeadFunnelChart } from '@/components/admin/charts/LeadFunnelChart';
import { PendingCampaignsWidget } from '@/components/admin/widgets/PendingCampaignsWidget';
import { RecentActivityWidget } from '@/components/admin/widgets/RecentActivityWidget';

export default function AdminPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: campaigns, isLoading: campaignsLoading } = useAdminCampaigns();

  // Calculate additional stats
  const pendingCampaigns = campaigns?.filter((c) => c.status === 'PENDING_REVIEW') || [];
  const activeCampaigns = campaigns?.filter((c) => c.status === 'ACTIVE').length || 0;
  const totalRevenue = campaigns?.reduce((acc, c) => acc + (c.totalPaid * (c.pricePerLead || 0)), 0) || 0;
  const totalQualifiedLeads = campaigns?.reduce((acc, c) => acc + c.totalQualified, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Dashboard Admin
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme Queen Mama
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <GlassCard
          className="p-6 cursor-pointer"
          hoverable
          glowColor="purple"
          onClick={() => router.push('/admin/users')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Utilisateurs</h3>
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Users className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.activeUsers || 0} actifs
            </p>
          </div>
        </GlassCard>

        <GlassCard
          className="p-6 cursor-pointer"
          hoverable
          glowColor="blue"
          onClick={() => router.push('/admin/campaigns')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Campagnes</h3>
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Target className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-400">
              {campaignsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : campaigns?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeCampaigns} actives
            </p>
          </div>
        </GlassCard>

        <GlassCard
          className="p-6 cursor-pointer"
          hoverable
          glowColor="yellow"
          onClick={() => router.push('/admin/campaigns?status=PENDING_REVIEW')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">En attente</h3>
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-yellow-400">
              {campaignsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingCampaigns.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              campagnes à valider
            </p>
          </div>
        </GlassCard>

        <GlassCard
          className="p-6 cursor-pointer"
          hoverable
          glowColor="green"
          onClick={() => router.push('/admin/leads')}
        >
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Leads Qualifiés</h3>
            <div className="p-2 rounded-lg bg-green-500/20">
              <UserCheck className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-400">
              {campaignsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalQualifiedLeads}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              total qualifiés
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverable>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Revenus</h3>
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-400">
              {campaignsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${totalRevenue.toLocaleString('fr-FR')}€`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              total généré
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 1 - Revenue & Campaign Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <CampaignStatusPieChart />
      </div>

      {/* Charts Row 2 - Lead Funnel & Pending Campaigns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadFunnelChart />
        <PendingCampaignsWidget />
      </div>

      {/* Widgets Row 3 - Recent Activity & SES Monitoring */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityWidget />
        <SESMonitoringWidget />
      </div>
    </div>
  );
}
