'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/landing/GradientText';
import { GlassCard } from '@/components/landing/GlassCard';
import { Crown, CheckCircle, ArrowRight, CreditCard, Zap } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'deposit' or 'recharge'
  const campaignId = searchParams.get('campaign_id');

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect based on payment type
          if (type === 'deposit') {
            router.push('/campaigns');
          } else {
            router.push('/leads');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, type]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-background to-emerald-900/20" />

      {/* Animated floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/30 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float"
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

            {/* Success Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="py-4"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-4">
                <GradientText variant="blue-cyan">Paiement reussi !</GradientText>
              </h1>

              {type === 'deposit' ? (
                <>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-green-500" />
                    <span className="text-lg text-foreground">Depot confirme</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Votre depot a ete effectue avec succes. Votre campagne est maintenant active et vous disposez de 2 credits pour debloquer vos premiers leads.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-green-500" />
                    <span className="text-lg text-foreground">Credits ajoutes</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Vos credits ont ete ajoutes a votre campagne. Vous pouvez maintenant debloquer de nouveaux leads.
                  </p>
                </>
              )}

              <div className="text-sm text-muted-foreground mb-6">
                Redirection automatique dans {countdown} secondes...
              </div>

              <Button
                onClick={() => router.push(type === 'deposit' ? '/campaigns' : '/leads')}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-glow-sm hover:shadow-glow-md transition-all group"
              >
                <span className="flex items-center gap-2">
                  {type === 'deposit' ? 'Voir mes campagnes' : 'Voir mes leads'}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
