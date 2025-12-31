'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/landing/GlassCard';
import { Crown, XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'deposit' or 'recharge'
  const campaignId = searchParams.get('campaign_id');

  const handleRetry = () => {
    // For deposit, go back to campaigns to find the email or dashboard
    // For recharge, go to leads page
    if (type === 'deposit' && campaignId) {
      router.push(`/campaigns/${campaignId}`);
    } else {
      router.push('/leads');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-background to-red-900/20" />

      {/* Animated floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-3s' }}
      />

      <div className="w-full max-w-md space-y-6 p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Queen Mama
                </span>
              </Link>
            </div>

            {/* Cancel Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="py-4"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-orange-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-4 text-orange-400">
                Paiement annule
              </h1>

              <p className="text-muted-foreground mb-6">
                {type === 'deposit' ? (
                  <>
                    Votre paiement de depot a ete annule. Votre campagne reste en attente d&apos;activation.
                    Vous pouvez reessayer a tout moment depuis votre email ou votre tableau de bord.
                  </>
                ) : (
                  <>
                    Votre paiement de recharge a ete annule. Aucun credit n&apos;a ete ajoute a votre compte.
                    Vous pouvez reessayer depuis la page de leads.
                  </>
                )}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Reessayer le paiement
                  </span>
                </Button>

                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au tableau de bord
                  </span>
                </Button>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
