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
import { Eye, Mail } from 'lucide-react';

// Données de démo
const leads = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'j***@example.com',
    company: 'TechStart Inc',
    title: 'CEO',
    campaign: 'SaaS Startup Outreach',
    status: 'Qualified',
    qualityScore: 85,
    isRevealed: false,
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 's***@example.com',
    company: 'Digital Agency Pro',
    title: 'Marketing Director',
    campaign: 'Marketing Agencies',
    status: 'Interested',
    qualityScore: 92,
    isRevealed: false,
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Smith',
    email: 'm***@example.com',
    company: 'E-Shop Solutions',
    title: 'Founder',
    campaign: 'E-commerce CEOs',
    status: 'Qualified',
    qualityScore: 78,
    isRevealed: false,
  },
  {
    id: 4,
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'e***@example.com',
    company: 'Growth Hackers Ltd',
    title: 'CMO',
    campaign: 'SaaS Startup Outreach',
    status: 'Replied',
    qualityScore: 65,
    isRevealed: false,
  },
  {
    id: 5,
    firstName: 'David',
    lastName: 'Brown',
    email: 'd***@example.com',
    company: 'Consulting Experts',
    title: 'Partner',
    campaign: 'Tech Consultants',
    status: 'Contacted',
    qualityScore: 55,
    isRevealed: false,
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; className: string }> = {
    Qualified: { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    Interested: { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    Replied: { variant: 'secondary', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    Contacted: { variant: 'outline', className: '' },
  };

  return variants[status] || variants.Contacted;
};

export default function LeadsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground">
              View and manage your qualified leads
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Quality</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  const badge = getStatusBadge(lead.status);
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.firstName} {lead.lastName}
                        <br />
                        <span className="text-sm text-muted-foreground">{lead.email}</span>
                      </TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell className="text-sm">{lead.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead.campaign}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className={badge.className}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                lead.qualityScore >= 80
                                  ? 'bg-green-500'
                                  : lead.qualityScore >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${lead.qualityScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{lead.qualityScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Unlock €30
                        </Button>
                      </TableCell>
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
