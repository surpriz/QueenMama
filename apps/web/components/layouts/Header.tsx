'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, LogOut, Settings, Crown, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-white/10">
      <div className="flex h-16 items-center px-6">
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <div className="relative">
                  <User className="h-5 w-5" />
                  {isAdmin && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-lg border-white/10">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    {isAdmin && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 rounded border border-purple-500/20">
                        <Shield className="h-2.5 w-2.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer hover:bg-white/5">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
