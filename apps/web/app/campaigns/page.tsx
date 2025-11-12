import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';

// Données de démo
const campaigns = [
  {
    id: 1,
    name: 'SaaS Startup Outreach',
    status: 'Active',
    totalContacted: 145,
    totalReplies: 32,
    totalQualified: 23,
    budget: 2500,
    pricePerLead: 30,
  },
  {
    id: 2,
    name: 'E-commerce CEOs',
    status: 'Active',
    totalContacted: 98,
    totalReplies: 19,
    totalQualified: 18,
    budget: 1800,
    pricePerLead: 25,
  },
  {
    id: 3,
    name: 'Marketing Agencies',
    status: 'Paused',
    totalContacted: 67,
    totalReplies: 11,
    totalQualified: 8,
    budget: 1200,
    pricePerLead: 30,
  },
  {
    id: 4,
    name: 'Tech Consultants',
    status: 'Draft',
    totalContacted: 0,
    totalReplies: 0,
    totalQualified: 0,
    budget: 3000,
    pricePerLead: 35,
  },
  {
    id: 5,
    name: 'Real Estate Professionals',
    status: 'Completed',
    totalContacted: 250,
    totalReplies: 48,
    totalQualified: 36,
    budget: 5000,
    pricePerLead: 40,
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; className: string }> = {
    Active: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    Paused: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    Draft: { variant: 'outline', className: '' },
    Completed: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  };

  return variants[status] || variants.Draft;
};

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your lead generation campaigns
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Contacted</TableHead>
                  <TableHead className="text-right">Replies</TableHead>
                  <TableHead className="text-right">Qualified</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Price/Lead</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const badge = getStatusBadge(campaign.status);
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className={badge.className}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{campaign.totalContacted}</TableCell>
                      <TableCell className="text-right">{campaign.totalReplies}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {campaign.totalQualified}
                      </TableCell>
                      <TableCell className="text-right">€{campaign.budget}</TableCell>
                      <TableCell className="text-right">€{campaign.pricePerLead}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
