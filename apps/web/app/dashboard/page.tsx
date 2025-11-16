'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-campaigns';

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
    },
    {
      title: 'Active Leads',
      value: stats?.activeLeads.toString() || '0',
      description: 'Contacted and engaged',
      icon: Users,
      trend: stats?.activeLeadsGrowth || '0%',
    },
    {
      title: 'Qualified Leads',
      value: stats?.qualifiedLeads.toString() || '0',
      description: 'Ready to unlock',
      icon: TrendingUp,
      trend: stats?.qualifiedLeadsGrowth || '0%',
    },
    {
      title: 'Revenue',
      value: `€${stats?.revenue.toFixed(2) || '0.00'}`,
      description: 'This month',
      icon: DollarSign,
      trend: stats?.revenueGrowth || '0%',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your lead generation performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                  <p className="text-xs text-green-600 mt-1">{card.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Campaigns */}
        {stats?.recentCampaigns && stats.recentCampaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest lead generation campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{campaign.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{campaign.leads} leads</span>
                        <span className="text-green-600">{campaign.qualified} qualified</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : campaign.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700'
                            : campaign.status === 'PAUSED'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {stats?.recentCampaigns && stats.recentCampaigns.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest lead generation campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign to start generating leads
                </p>
                <a
                  href="/campaigns/new"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Create Campaign
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
