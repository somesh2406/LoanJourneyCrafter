import { Plus, Upload, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LibraryNavbarProps {
  onCreateClick: () => void;
  onImportClick: () => void;
}

export function LibraryNavbar({ onCreateClick, onImportClick }: LibraryNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Loan Journey Studio
            </span>
            <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
              Enterprise V1
            </span>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onImportClick} className="cursor-pointer">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Import Journey
          </Button>
          <Button variant="default" size="sm" onClick={onCreateClick} className="cursor-pointer">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Journey
          </Button>
        </div>
      </div>
    </header>
  );
}
