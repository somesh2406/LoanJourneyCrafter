import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
  title,
  description,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl transition-all',
          className
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {title && (
          <div className="mb-4">
            <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
            {description && (
              <p id="dialog-description" className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}>
      {children}
    </div>
  );
}
