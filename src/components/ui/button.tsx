import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
      outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
      ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
      link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-3.5 py-2 h-9 gap-2',
      lg: 'text-base px-5 py-2.5 h-10 gap-2.5',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
