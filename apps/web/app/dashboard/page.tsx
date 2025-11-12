import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, DollarSign, TrendingUp } from 'lucide-react';

// Données de démo
const stats = [
  {
    title: 'Total Campaigns',
    value: '12',
    description: '+2 since last month',
    icon: Target,
    trend: '+15%',
  },
  {
    title: 'Active Leads',
    value: '847',
    description: '+180 from last week',
    icon: Users,
    trend: '+27%',
  },
  {
    title: 'Qualified Leads',
    value: '126',
    description: 'Ready to unlock',
    icon: TrendingUp,
    trend: '+12%',
  },
  {
    title: 'Revenue',
    value: '€12,450',
    description: 'This month',
    icon: DollarSign,
    trend: '+32%',
  },
];

const recentCampaigns = [
  { id: 1, name: 'SaaS Startup Outreach', status: 'Active', leads: 145, qualified: 23 },
  { id: 2, name: 'E-commerce CEOs', status: 'Active', leads: 98, qualified: 18 },
  { id: 3, name: 'Marketing Agencies', status: 'Paused', leads: 67, qualified: 8 },
];

export default function DashboardPage() {
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
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest lead generation campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
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
                        campaign.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
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
      </div>
    </DashboardLayout>
  );
}
