'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, Users, Settings, Shield, Crown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const sidebarLinks = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Target,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="pb-12 w-64 bg-card/50 backdrop-blur-sm border-r border-white/10">
      <div className="space-y-4 py-4">
        {/* Logo */}
        <div className="px-4 py-2 mb-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Queen Mama
            </span>
          </Link>
        </div>

        <div className="px-3 py-2">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </h3>
          <div className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-foreground font-medium border border-white/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    isActive && 'text-purple-500'
                  )} />
                  {link.title}
                </Link>
              );
            })}

            {/* Admin Panel - Only visible to admins */}
            {isAdmin && (
              <>
                <div className="my-4 border-t border-white/10" />
                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administration
                </h3>
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-foreground font-medium border border-white/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <Shield className={cn(
                    'h-5 w-5',
                    (pathname === '/admin' || pathname.startsWith('/admin/')) && 'text-purple-500'
                  )} />
                  Admin Panel
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
