'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, Users, UserCog, Settings, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  pendingCampaignsCount?: number;
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Campagnes',
    href: '/admin/campaigns',
    icon: Target,
    showBadge: true,
  },
  {
    title: 'Leads',
    href: '/admin/leads',
    icon: Users,
  },
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: UserCog,
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ pendingCampaignsCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="pb-12 w-64 bg-card/50 backdrop-blur-sm border-r border-white/10">
      <div className="space-y-4 py-4">
        {/* Logo */}
        <div className="px-4 py-2 mb-4">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Queen Mama
              </span>
              <span className="text-[10px] font-medium text-purple-400 uppercase tracking-wider -mt-1">
                Administration
              </span>
            </div>
          </Link>
        </div>

        <div className="px-3 py-2">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Gestion
          </h3>
          <div className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);
              const showBadge = item.showBadge && pendingCampaignsCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-foreground font-medium border border-white/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      'h-5 w-5',
                      isActive && 'text-purple-500'
                    )} />
                    {item.title}
                  </div>
                  {showBadge && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-1.5 py-0.5 min-w-[20px] text-center"
                    >
                      {pendingCampaignsCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
