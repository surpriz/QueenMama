'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: LucideIcon;
  decimals?: number;
}

export function MetricCard({
  value,
  suffix = '',
  prefix = '',
  label,
  icon: Icon,
  decimals = 0
}: MetricCardProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const start = Date.now();
      const startValue = 0;
      const endValue = value;

      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;

        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [isInView, value]);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <div ref={ref} className="text-center space-y-3">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/10">
        <Icon className="h-7 w-7 text-purple-500" />
      </div>
      <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        {prefix}{displayValue}{suffix}
      </p>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
