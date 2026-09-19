import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'danger' | 'warning';
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-slate-200', className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer border-b-2',
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
