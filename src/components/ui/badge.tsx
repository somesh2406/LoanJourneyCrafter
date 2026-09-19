import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'border-slate-300 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
