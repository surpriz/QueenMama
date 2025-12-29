'use client';

import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'purple' | 'blue' | 'green' | 'none';
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className,
  glowColor = 'none',
  hoverable = false
}: GlassCardProps) {
  const glowClasses = {
    purple: 'hover:shadow-glow-md',
    blue: 'hover:shadow-glow-blue',
    green: 'hover:shadow-glow-green',
    none: '',
  };

  return (
    <div
      className={cn(
        'relative p-8 rounded-2xl',
        'bg-card/50 backdrop-blur-sm',
        'border border-white/10 dark:border-white/5',
        hoverable && 'transition-all duration-300 hover:border-white/20 hover:-translate-y-1',
        hoverable && glowClasses[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}
