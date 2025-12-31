'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { GlassCard } from '@/components/landing/GlassCard';
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
import { Eye, Mail, Loader2, Users, Lock, CheckCircle, Sparkles, CreditCard, Zap } from 'lucide-react';
import { useLeads, useUnlockLead } from '@/hooks/use-leads';
import { useCreateRecharge } from '@/hooks/use-payments';
import { RechargeModal } from '@/components/payments/RechargeModal';
import { Lead, LeadStatus, LeadUnlockRequiresPayment, RechargeOption } from '@/lib/api';
import { useState } from 'react';

const getStatusBadge = (status: LeadStatus) => {
  const variants: Record<LeadStatus, { className: string }> = {
    CONTACTED: { className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    OPENED: { className: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
    REPLIED: { className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    INTERESTED: { className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
    QUALIFIED: { className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    PAID: { className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    NOT_INTERESTED: { className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30' },
    BOUNCED: { className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    UNSUBSCRIBED: { className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  };
  return variants[status];
};

export default function LeadsPage() {
  const { data: leads, isLoading, refetch } = useLeads();
  const unlockLead = useUnlockLead();
  const createRecharge = useCreateRecharge();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Recharge modal state
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeData, setRechargeData] = useState<LeadUnlockRequiresPayment | null>(null);

  const handleUnlockClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowUnlockModal(true);
  };

  const handleUnlockConfirm = async () => {
    if (!selectedLead) return;

    try {
      const result = await unlockLead.mutateAsync(selectedLead.id);

      // Check if payment is required (no credits)
      if (result.requiresPayment) {
        setShowUnlockModal(false);
        setRechargeData(result as LeadUnlockRequiresPayment);
        setShowRechargeModal(true);
      } else {
        // Lead unlocked successfully with credits
        alert(
          `Lead debloque avec succes! Reste ${result.remainingCredits} credits. Contact: ${result.lead.email}`
        );
        setShowUnlockModal(false);
        setSelectedLead(null);
        refetch(); // Refresh leads list
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors du deblocage');
    }
  };

  const handleRecharge = async (leadCount: 5 | 10, pendingLeadId?: string) => {
    if (!rechargeData) return;

    try {
      await createRecharge.mutateAsync({
        campaignId: rechargeData.campaignId,
        data: {
          leadCount,
          pendingLeadId,
        },
      });
      // User will be redirected to Stripe Checkout
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la recharge');
    }
  };

  const handleCloseRechargeModal = () => {
    setShowRechargeModal(false);
    setRechargeData(null);
    setSelectedLead(null);
  };

  // Get price from campaign (will be replaced by actual campaign data)
  const getUnlockPrice = (lead: Lead) => {
    // @ts-ignore - campaign might have pricePerLead
    return lead.campaign?.pricePerLead || 30;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Leads
            </h1>
            <p className="text-muted-foreground">
              View and unlock your qualified leads
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled className="border-white/10 hover:bg-white/5">
              <Mail className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">All Leads</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : !leads || leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 inline-block mb-4">
                <Users className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Leads will appear here once your campaigns generate qualified responses
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Company</TableHead>
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Campaign</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Quality</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
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
                      <TableRow key={lead.id} className="border-white/10 hover:bg-white/5 transition-colors">
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
                              <div className="w-12 bg-white/10 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    lead.qualityScore >= 80
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                      : lead.qualityScore >= 60
                                      ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                                      : 'bg-gradient-to-r from-red-500 to-pink-400'
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
                            <Button size="sm" variant="outline" disabled className="border-green-500/30 text-green-400">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Unlocked
                            </Button>
                          ) : isUnlockable ? (
                            <Button
                              size="sm"
                              onClick={() => handleUnlockClick(lead)}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Unlock €{getUnlockPrice(lead)}
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="border-white/10">
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
        </GlassCard>
      </div>

      {/* Unlock Confirmation Modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="bg-card/95 backdrop-blur-lg border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Unlock Lead Contact
            </DialogTitle>
            <DialogDescription>
              You are about to unlock full contact information for this lead.
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-medium text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-medium text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{selectedLead.company}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-medium text-muted-foreground">Title</p>
                  <p className="text-sm font-medium">{selectedLead.title}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-medium text-muted-foreground">
                    Quality Score
                  </p>
                  <p className="text-sm font-medium">
                    {selectedLead.qualityScore || 'N/A'}%
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <div>
                    <p className="font-medium">Amount to Pay</p>
                    <p className="text-sm text-muted-foreground">
                      One-time payment to reveal full contact
                    </p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    €{getUnlockPrice(selectedLead)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  <strong>What you'll get:</strong>
                </p>
                <ul className="text-sm text-blue-300/80 mt-2 space-y-1">
                  <li>• Full email address</li>
                  <li>• Phone number (if available)</li>
                  <li>• LinkedIn profile (if available)</li>
                  <li>• Complete response content</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnlockModal(false)}
              disabled={unlockLead.isPending}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlockConfirm}
              disabled={unlockLead.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
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

      {/* Recharge Modal */}
      {rechargeData && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={handleCloseRechargeModal}
          onRecharge={handleRecharge}
          options={rechargeData.rechargeOptions}
          pricePerLead={rechargeData.pricePerLead}
          pendingLeadId={rechargeData.leadId}
          campaignName={(selectedLead as any)?.campaign?.name}
        />
      )}
    </DashboardLayout>
  );
}
