'use client';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Mail, Loader2, Users, Lock, CheckCircle } from 'lucide-react';
import { useLeads, useUnlockLead } from '@/hooks/use-leads';
import { Lead, LeadStatus } from '@/lib/api';
import { useState } from 'react';

const getStatusBadge = (status: LeadStatus) => {
  const variants: Record<LeadStatus, { className: string }> = {
    CONTACTED: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    OPENED: { className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200' },
    REPLIED: { className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    INTERESTED: { className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    QUALIFIED: { className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    PAID: { className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
    NOT_INTERESTED: { className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    BOUNCED: { className: 'bg-red-100 text-red-700 hover:bg-red-200' },
    UNSUBSCRIBED: { className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  };
  return variants[status];
};

export default function LeadsPage() {
  const { data: leads, isLoading } = useLeads();
  const unlockLead = useUnlockLead();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const handleUnlockClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowUnlockModal(true);
  };

  const handleUnlockConfirm = async () => {
    if (!selectedLead) return;

    try {
      const result = await unlockLead.mutateAsync(selectedLead.id);
      alert(
        `Lead unlocked successfully! You paid €${result.amountPaid}. Contact: ${result.lead.email}`
      );
      setShowUnlockModal(false);
      setSelectedLead(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to unlock lead');
    }
  };

  // Calculate unlock price based on lead status (simplified MVP logic)
  const getUnlockPrice = (lead: Lead) => {
    return 30; // Fixed price for MVP
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground">
              View and unlock your qualified leads
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !leads || leads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No leads yet</p>
                <p className="text-sm text-muted-foreground">
                  Leads will appear here once your campaigns generate qualified responses
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                      const isUnlockable =
                        lead.status === 'QUALIFIED' ||
                        lead.status === 'INTERESTED';
                      const isAlreadyPaid = lead.isRevealed || lead.status === 'PAID';

                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.firstName} {lead.lastName}
                            <br />
                            <span className="text-sm text-muted-foreground font-mono">
                              {lead.email}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{lead.company}</div>
                              {lead.location && (
                                <div className="text-xs text-muted-foreground">
                                  {lead.location}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{lead.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {/* @ts-ignore */}
                            {lead.campaign?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={badge.className}>{lead.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {lead.qualityScore !== null &&
                            lead.qualityScore !== undefined ? (
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
                                <span className="text-sm font-medium">
                                  {lead.qualityScore}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isAlreadyPaid ? (
                              <Button size="sm" variant="outline" disabled>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Unlocked
                              </Button>
                            ) : isUnlockable ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUnlockClick(lead)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Unlock €{getUnlockPrice(lead)}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <Lock className="mr-2 h-4 w-4" />
                                Not Available
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unlock Confirmation Modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Lead Contact</DialogTitle>
            <DialogDescription>
              You are about to unlock full contact information for this lead.
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="text-sm">{selectedLead.company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-sm">{selectedLead.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Quality Score
                  </p>
                  <p className="text-sm">
                    {selectedLead.qualityScore || 'N/A'}%
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Amount to Pay</p>
                    <p className="text-sm text-muted-foreground">
                      One-time payment to reveal full contact
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    €{getUnlockPrice(selectedLead)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>What you'll get:</strong>
                  <br />
                  • Full email address
                  <br />
                  • Phone number (if available)
                  <br />
                  • LinkedIn profile (if available)
                  <br />• Complete response content
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnlockModal(false)}
              disabled={unlockLead.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlockConfirm}
              disabled={unlockLead.isPending}
            >
              {unlockLead.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Unlock Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
