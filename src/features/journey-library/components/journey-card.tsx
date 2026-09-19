import { Pin, PinOff, Calendar, Layers, Activity, ArrowRight, Trash2 } from 'lucide-react';
import { JourneySummary } from '@/domain/journey/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface JourneyCardProps {
  journey: JourneySummary;
  onOpen: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function JourneyCard({ journey, onOpen, onTogglePin, onDelete }: JourneyCardProps) {
  const formattedDate = new Date(journey.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'purple'> = {
    draft: 'secondary',
    in_review: 'warning',
    published: 'success',
    archived: 'secondary',
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariants[journey.status] || 'secondary'}>
              {journey.status.replace('_', ' ')}
            </Badge>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-600">
              v{journey.version}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(journey.id);
              }}
              title={journey.isPinned ? 'Unpin Journey' : 'Pin Journey'}
              aria-label={journey.isPinned ? 'Unpin Journey' : 'Pin Journey'}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {journey.isPinned ? (
                <Pin className="h-4 w-4 fill-blue-600 text-blue-600" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(journey.id);
                }}
                title="Delete Journey"
                aria-label="Delete Journey"
                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-3">
          <h3
            onClick={() => onOpen(journey.id)}
            className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
          >
            {journey.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
            {journey.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Metrics & Actions Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1" title="Stages count">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>{journey.stageCount} {journey.stageCount === 1 ? 'stage' : 'stages'}</span>
          </span>
          <span className="flex items-center gap-1" title="Total nodes">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span>{journey.nodeCount} {journey.nodeCount === 1 ? 'node' : 'nodes'}</span>
          </span>
          <span className="hidden sm:flex items-center gap-1" title="Last updated">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => onOpen(journey.id)}
          className="gap-1 text-xs px-2.5 py-1 h-7 cursor-pointer"
        >
          <span>Open</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
