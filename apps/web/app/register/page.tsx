'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GradientText } from '@/components/landing/GradientText';
import { GlassCard } from '@/components/landing/GlassCard';
import { Crown, ArrowLeft, ArrowRight, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      // Don't send confirmPassword to API
      const { confirmPassword, ...registerData } = formData;
      await api.post('/auth/register', registerData);

      // Show verification message
      setRegisteredEmail(formData.email);
      setShowVerificationMessage(true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setError('');

    try {
      await api.post('/auth/resend-verification', { email: registeredEmail });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'envoi';
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const benefits = [
    'Analyse de marche gratuite',
    'Aucun engagement',
    'Paiement uniquement aux resultats',
  ];

  // Show verification success message
  if (showVerificationMessage) {
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
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-purple-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">
                <GradientText variant="purple-blue">Verifiez votre email</GradientText>
              </h1>

              {/* Message */}
              <p className="text-muted-foreground mb-2">
                Un email de verification a ete envoye a :
              </p>
              <p className="font-medium text-foreground mb-6">
                {registeredEmail}
              </p>

              <p className="text-sm text-muted-foreground mb-6">
                Cliquez sur le lien dans l'email pour activer votre compte.
                Le lien expire dans 24 heures.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg mb-4"
                >
                  {error}
                </motion.div>
              )}

              {/* Resend Button */}
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full mb-4 border-white/10 hover:bg-white/5"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Renvoyer l'email
                  </span>
                )}
              </Button>

              {/* Login Link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour a la connexion
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

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
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour
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
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">
                <GradientText variant="purple-blue">Creer un compte</GradientText>
              </h1>
              <p className="text-muted-foreground">
                Commencez a generer des leads qualifies
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  {benefit}
                </motion.div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prenom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="h-11 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="h-11 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jean@entreprise.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Mon Entreprise SAS"
                  value={formData.company}
                  onChange={handleChange}
                  className="h-11 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
                />
                <p className="text-xs text-muted-foreground">
                  8 caracteres minimum
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 bg-background/50 border-white/10 focus:border-purple-500/50 transition-colors"
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
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-glow-sm hover:shadow-glow-md transition-all group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creation en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Creer mon compte
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Deja un compte ?{' '}
                <Link
                  href="/login"
                  className="font-medium bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Terms */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              En creant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="underline hover:text-foreground transition-colors">
                Conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                Politique de confidentialite
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
