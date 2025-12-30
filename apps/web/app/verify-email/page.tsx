'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/landing/GradientText';
import { GlassCard } from '@/components/landing/GlassCard';
import { Crown, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Token de verification manquant');
        return;
      }

      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 'Erreur lors de la verification'
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20" />

      {/* Animated floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"
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

            {/* Loading State */}
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8"
              >
                <div className="flex justify-center mb-6">
                  <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                </div>
                <h1 className="text-xl font-semibold text-foreground mb-2">
                  Verification en cours...
                </h1>
                <p className="text-muted-foreground">
                  Veuillez patienter pendant que nous verifions votre email.
                </p>
              </motion.div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-4">
                  <GradientText variant="purple-blue">Email verifie !</GradientText>
                </h1>

                <p className="text-muted-foreground mb-6">
                  Votre adresse email a ete verifiee avec succes. Vous pouvez maintenant vous connecter a votre compte.
                </p>

                <Button
                  onClick={() => router.push('/login')}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md transition-all group"
                >
                  <span className="flex items-center gap-2">
                    Se connecter
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-4 text-red-400">
                  Echec de la verification
                </h1>

                <p className="text-muted-foreground mb-6">
                  {errorMessage}
                </p>

                <div className="space-y-3">
                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="w-full border-white/10 hover:bg-white/5"
                    >
                      Creer un nouveau compte
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      Retour a la connexion
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
