import { Sparkles, ArrowRight, ShieldCheck, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HeroBannerProps {
  onCreateClick: () => void;
}

export function HeroBanner({ onCreateClick }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fintech & Banking Workflow Orchestration</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Design your loan journeys visually.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            A production-ready visual studio for credit risk officers, product managers, and
            underwriting engineers to design, simulate, validate, and maintain loan origination
            workflows with Stage hierarchies and decision branching.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button size="md" onClick={onCreateClick} className="gap-2 cursor-pointer">
              <span>New Journey</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Deterministic Validation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Workflow className="h-4 w-4 text-blue-600" />
                <span>Multi-Condition Branching</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
