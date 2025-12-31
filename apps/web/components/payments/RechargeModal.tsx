'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Zap, Check, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RechargeOption {
  leads: number;
  total: number;
  label: string;
}

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (leadCount: 5 | 10, pendingLeadId?: string) => Promise<void>;
  options: RechargeOption[];
  pricePerLead: number;
  pendingLeadId?: string;
  campaignName?: string;
}

export function RechargeModal({
  isOpen,
  onClose,
  onRecharge,
  options,
  pricePerLead,
  pendingLeadId,
  campaignName,
}: RechargeModalProps) {
  const [selectedOption, setSelectedOption] = useState<5 | 10>(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecharge = async () => {
    setIsLoading(true);
    try {
      await onRecharge(selectedOption, pendingLeadId);
    } catch (error) {
      console.error('Recharge error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader className="text-center sm:text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            Recharger vos credits
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {pendingLeadId ? (
              <>Credits insuffisants pour debloquer ce lead. Rechargez pour continuer.</>
            ) : (
              <>Ajoutez des credits pour debloquer plus de leads.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campaign Info */}
          {campaignName && (
            <div className="text-center text-sm text-muted-foreground">
              Campagne: <span className="text-foreground font-medium">{campaignName}</span>
            </div>
          )}

          {/* Price per lead info */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Prix par lead: <span className="text-foreground font-semibold">{pricePerLead.toFixed(2)} EUR</span>
            </span>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <motion.button
                key={option.leads}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOption(option.leads as 5 | 10)}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all duration-200',
                  selectedOption === option.leads
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                )}
              >
                {option.leads === 10 && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                    Populaire
                  </Badge>
                )}

                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {option.leads}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    leads
                  </div>
                  <div className="text-lg font-semibold text-purple-400">
                    {option.total.toFixed(2)} EUR
                  </div>
                </div>

                {selectedOption === option.leads && (
                  <div className="absolute top-2 left-2">
                    <Check className="h-5 w-5 text-purple-500" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Auto-unlock info */}
          {pendingLeadId && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-400">
                Le lead sera automatiquement debloque apres le paiement
              </span>
            </div>
          )}

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Paiement securise via Stripe</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRecharge}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Payer {options.find(o => o.leads === selectedOption)?.total.toFixed(2)} EUR
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
