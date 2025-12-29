'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export function DashboardMockup() {
  return (
    <div className="relative">
      {/* Glow behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl" />

      {/* Main dashboard frame */}
      <div className="relative rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Window controls */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-secondary/50">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-4 text-xs text-muted-foreground">Queen Mama Dashboard</span>
        </div>

        {/* Dashboard content */}
        <div className="p-6 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-green-500">+23% this month</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-muted-foreground">Qualified</p>
              <p className="text-2xl font-bold">342</p>
              <p className="text-xs text-green-500">27% rate</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">8,550</p>
              <p className="text-xs text-green-500">This month</p>
            </div>
          </div>

          {/* Mini chart placeholder */}
          <div className="h-32 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-white/10 flex items-end justify-center gap-1 p-4">
            {[40, 65, 45, 80, 55, 90, 70, 85, 95].map((h, i) => (
              <div
                key={i}
                className="w-6 rounded-t bg-gradient-to-t from-purple-500 to-blue-500 transition-all duration-300"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Lead list preview */}
          <div className="space-y-2">
            {[
              { name: 'Sarah M.', title: 'VP Sales @ TechCorp' },
              { name: 'John D.', title: 'CEO @ StartupXYZ' },
            ].map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-medium">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-medium">{lead.name}</span>
                    <p className="text-xs text-muted-foreground">{lead.title}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                  Qualified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification card */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 top-16 p-4 rounded-xl bg-card border border-white/10 shadow-lg shadow-purple-500/10"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium">New qualified lead!</p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
