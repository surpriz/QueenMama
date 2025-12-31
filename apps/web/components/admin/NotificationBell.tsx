'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { usePendingCampaigns } from '@/hooks/use-admin-notifications';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const router = useRouter();
  const { data: pendingCampaigns, isLoading } = usePendingCampaigns();
  const count = pendingCampaigns?.length || 0;

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/admin/campaigns/${campaignId}`);
  };

  const handleViewAll = () => {
    router.push('/admin/campaigns?status=PENDING_REVIEW');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-white/5 relative"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center",
              "text-[10px] font-bold text-white rounded-full",
              "bg-gradient-to-r from-red-500 to-orange-500",
              "animate-pulse"
            )}>
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-card/95 backdrop-blur-lg border-white/10"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Campagnes en attente</span>
          {count > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              {count}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />

        {isLoading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        ) : count === 0 ? (
          <div className="py-6 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune campagne en attente
            </p>
          </div>
        ) : (
          <>
            <div className="max-h-[300px] overflow-y-auto">
              {pendingCampaigns?.slice(0, 5).map((campaign) => {
                const customerName =
                  campaign.customer.firstName && campaign.customer.lastName
                    ? `${campaign.customer.firstName} ${campaign.customer.lastName}`
                    : campaign.customer.email;

                return (
                  <DropdownMenuItem
                    key={campaign.id}
                    onClick={() => handleCampaignClick(campaign.id)}
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-white/5 focus:bg-white/5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {campaign.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-full">
                      {customerName}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </div>
            {count > 5 && (
              <>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleViewAll}
                  className="text-center text-sm text-purple-400 hover:text-purple-300 cursor-pointer hover:bg-white/5 focus:bg-white/5 justify-center"
                >
                  Voir toutes les campagnes ({count})
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
