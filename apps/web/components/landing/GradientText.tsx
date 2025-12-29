'use client';

import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'purple-blue' | 'pink-orange' | 'blue-cyan' | 'animated';
}

export function GradientText({
  children,
  className,
  variant = 'purple-blue'
}: GradientTextProps) {
  const variants = {
    'purple-blue': 'from-purple-600 to-blue-500',
    'pink-orange': 'from-pink-500 to-orange-400',
    'blue-cyan': 'from-blue-500 to-cyan-400',
    'animated': 'from-purple-600 via-pink-500 to-blue-500 bg-[length:200%_auto] animate-gradient-x',
  };

  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
