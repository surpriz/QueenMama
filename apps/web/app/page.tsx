'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/landing/GradientText';
import { GlassCard } from '@/components/landing/GlassCard';
import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { MetricCard } from '@/components/landing/MetricCard';
import { BackToTop } from '@/components/ui/BackToTop';
import {
  ArrowRight,
  Target,
  Mail,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Star,
  Users,
  Building,
  Crown,
  Sparkles,
  PlayCircle,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react';

const features = [
  {
    title: 'Launch in 24 Hours',
    description: 'Define your ICP, approve email sequences, and watch qualified leads flow in within a day.',
    icon: Zap,
    color: 'purple' as const,
  },
  {
    title: 'Quality Guaranteed',
    description: 'Only pay for leads that show genuine interest. No interest = no charge.',
    icon: Shield,
    color: 'blue' as const,
  },
  {
    title: 'Predictable ROI',
    description: 'Know exactly what each lead costs. Scale confidently with transparent pricing.',
    icon: TrendingUp,
    color: 'green' as const,
  },
];

const steps = [
  {
    title: 'Define Your ICP',
    description: 'Tell us who your ideal customer is: industry, company size, titles, and locations.',
    icon: Target,
    gradient: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-500',
  },
  {
    title: 'We Handle Outreach',
    description: 'Our team crafts personalized emails and manages follow-ups automatically.',
    icon: Mail,
    gradient: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Get Qualified Leads',
    description: 'Receive only leads who responded positively. Pay per result, not per email.',
    icon: CheckCircle,
    gradient: 'from-green-500 to-emerald-600',
    iconColor: 'text-green-500',
  },
];

const pricingFeatures = [
  {
    title: 'Aucun abonnement',
    description: 'Pas de frais mensuels, pas d\'engagement',
    icon: CheckCircle,
  },
  {
    title: 'Prix fixé à l\'avance',
    description: 'Vous connaissez le prix avant de lancer',
    icon: Shield,
  },
  {
    title: 'Analyse gratuite',
    description: 'Notre équipe analyse votre marché gratuitement',
    icon: Target,
  },
  {
    title: 'Satisfaction garantie',
    description: 'Remboursement si vous n\'êtes pas satisfait',
    icon: Star,
  },
];

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookies', href: '/cookies' },
    ],
  },
];

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'GitHub', icon: Github, href: '#' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-lg border-b border-white/10" />
        <div className="container relative flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Queen Mama
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-glow-sm hover:shadow-glow-md transition-all">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />

          {/* Floating blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '-3s' }}
          />

          <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-24">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Pay Only For Results</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Get{' '}
                <GradientText variant="animated">Qualified Leads</GradientText>
                {' '}on Autopilot
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-muted-foreground max-w-lg">
                We handle cold outreach for B2B companies. You only pay when prospects show genuine interest.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 h-14 px-8 text-lg shadow-glow-md hover:shadow-glow-lg transition-all group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2 hover:bg-secondary/50 group"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span>500+ companies trust us</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground">4.9/5 on G2</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-20 border-y border-white/10 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <MetricCard value={50000} suffix="+" label="Leads Generated" icon={Users} />
              <MetricCard value={27} suffix="%" label="Avg. Response Rate" icon={TrendingUp} />
              <MetricCard value={500} suffix="+" label="Happy Customers" icon={Building} />
              <MetricCard value={4.9} suffix="/5" label="Customer Rating" icon={Star} decimals={1} />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative overflow-hidden">
          {/* Background gradient blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-4">
                Why Queen Mama?
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything you need to{' '}
                <GradientText>scale outbound</GradientText>
              </h2>
              <p className="text-xl text-muted-foreground">
                Focus on closing deals while we fill your pipeline with qualified opportunities.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard hoverable glowColor={feature.color}>
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${
                        feature.color === 'purple'
                          ? 'from-purple-500/20 to-purple-500/5'
                          : feature.color === 'blue'
                          ? 'from-blue-500/20 to-blue-500/5'
                          : 'from-green-500/20 to-green-500/5'
                      }`}
                    >
                      <feature.icon
                        className={`h-7 w-7 ${
                          feature.color === 'purple'
                            ? 'text-purple-500'
                            : feature.color === 'blue'
                            ? 'text-blue-500'
                            : 'text-green-500'
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
                Simple Process
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Three steps to{' '}
                <GradientText variant="blue-cyan">qualified leads</GradientText>
              </h2>
            </motion.div>

            <div className="relative max-w-5xl mx-auto">
              {/* Connecting line */}
              <div className="absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 hidden md:block rounded-full" />

              <div className="grid md:grid-cols-3 gap-8 relative">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="relative"
                  >
                    {/* Step number with gradient ring */}
                    <div className="relative mx-auto w-24 h-24 mb-8">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.gradient}`} />
                      <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                        <span className={`text-3xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                          {i + 1}
                        </span>
                      </div>
                      {/* Pulse effect */}
                      <div
                        className={`absolute inset-0 rounded-full animate-ping opacity-20 bg-gradient-to-br ${step.gradient}`}
                        style={{ animationDuration: '3s' }}
                      />
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary mb-4 border border-white/10">
                        <step.icon className={`h-7 w-7 ${step.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />

          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4">
                Tarification transparente
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Payez uniquement pour{' '}
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  les résultats
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Aucun abonnement. Prix adapté à votre marché.
              </p>
            </motion.div>

            {/* Single Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative rounded-3xl">
                {/* Gradient border */}
                <div className="absolute -inset-px bg-gradient-to-b from-purple-500 to-blue-500 rounded-3xl" />

                <div className="relative rounded-3xl p-10 bg-card">
                  {/* Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium shadow-glow-sm">
                    100% Pay-per-Lead
                  </div>

                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-semibold mb-3">Tarification dynamique</h3>
                    <p className="text-muted-foreground mb-6">
                      Le prix dépend de votre marché cible. Plus l'audience est large, plus le prix est bas.
                    </p>

                    {/* Price range */}
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        30€ - 60€
                      </span>
                      <span className="text-xl text-muted-foreground">/lead</span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">
                      Prix exact défini après analyse de votre marché
                    </p>
                  </div>

                  {/* Features grid */}
                  <div className="grid sm:grid-cols-2 gap-6 mb-10">
                    {pricingFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 flex items-center justify-center shrink-0">
                          <feature.icon className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href="/register" className="block">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-glow-sm hover:shadow-glow-md transition-all"
                    >
                      Demander une analyse gratuite
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Analyse de marché offerte - Réponse sous 24h
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-background to-blue-600/20" />

          {/* Animated gradient orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-transparent rounded-full blur-3xl animate-pulse-slow" />
            <div
              className="absolute inset-0 bg-gradient-to-l from-blue-500/30 to-transparent rounded-full blur-3xl animate-pulse-slow"
              style={{ animationDelay: '2s' }}
            />
          </div>

          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <h2 className="text-4xl md:text-6xl font-bold">
                Ready to{' '}
                <GradientText variant="animated">10x your pipeline?</GradientText>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join 500+ B2B companies already generating qualified leads on autopilot. Start your free trial today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-glow-md hover:shadow-glow-lg transition-all group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-2">
                  Schedule Demo
                </Button>
              </div>

              <p className="text-sm text-muted-foreground flex items-center justify-center gap-4 flex-wrap">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Cancel anytime
                </span>
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-secondary/30">
        {/* Top gradient accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        <div className="container py-16">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Queen Mama
                </span>
              </Link>
              <p className="text-muted-foreground max-w-xs">
                B2B lead generation platform that delivers qualified leads through automated outreach. Pay only for results.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors border border-white/10"
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((column) => (
              <div key={column.title} className="space-y-4">
                <h4 className="font-semibold">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Queen Mama. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}
