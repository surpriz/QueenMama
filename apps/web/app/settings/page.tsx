'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { GlassCard } from '@/components/landing/GlassCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { User, CreditCard, Bell, Settings } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and application settings
          </p>
        </div>

        <div className="grid gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <User className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Account Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your account information</p>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              <div className="grid gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm">{user?.firstName} {user?.lastName}</p>
              </div>
              <div className="grid gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{user?.email}</p>
              </div>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Facturation</h2>
                <p className="text-sm text-muted-foreground">Votre modèle de tarification</p>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              <div className="grid gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="text-sm font-medium text-muted-foreground">Tarification</label>
                <p className="text-sm">Pay-per-lead (30€ - 60€/lead selon le marché)</p>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Le prix par lead est défini pour chaque campagne selon l'analyse de votre marché cible.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Bell className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your campaigns
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                  Enabled
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
