'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GradientText } from '@/components/landing/GradientText';
import { GlassCard } from '@/components/landing/GlassCard';
import { Crown, ArrowLeft, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const message = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20" />

      {/* Animated floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-5s' }}
      />

      <div className="w-full max-w-md space-y-6 p-4 relative z-10">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour a la connexion
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-8">
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

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                  <Mail className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                <GradientText variant="purple-blue">Mot de passe oublie ?</GradientText>
              </h1>
              <p className="text-muted-foreground">
                Entrez votre email et nous vous enverrons un lien pour reinitialiser votre mot de passe
              </p>
            </div>

            {!success ? (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi en cours...
                      </span>
                    ) : (
                      'Envoyer le lien de reinitialisation'
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Vous vous souvenez de votre mot de passe ?{' '}
                    <Link
                      href="/login"
                      className="font-medium bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-colors"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <svg
                      className="w-10 h-10 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    Email envoye !
                  </h2>
                  <p className="text-muted-foreground">
                    Si cette adresse existe dans notre systeme, vous recevrez un email avec un lien de reinitialisation dans quelques instants.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Le lien expire dans <span className="font-semibold text-purple-500">24 heures</span>.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full h-12"
                  >
                    Envoyer a une autre adresse
                  </Button>
                  <Link href="/login" className="block">
                    <Button
                      variant="ghost"
                      className="w-full h-12"
                    >
                      Retour a la connexion
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* Trust indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-muted-foreground"
        >
          Vos donnees sont protegees et chiffrees
        </motion.p>
      </div>
    </div>
  );
}
