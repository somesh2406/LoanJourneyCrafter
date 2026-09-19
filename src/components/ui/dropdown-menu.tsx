import * as React from 'react';
import { cn } from '@/utils/cn';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-0 zoom-in-95',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              role="menuitem"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) {
                  item.onClick();
                  setOpen(false);
                }
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
