import * as React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { X } from 'lucide-react';
import { useJourneyStore } from '@/stores/journey-store';
import { cn } from '@/utils/cn';

export function JourneyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const deleteEdge = useJourneyStore((s) => s.deleteEdge);
  const [isHovered, setIsHovered] = React.useState(false);

  const conditionId = data?.conditionId as string | undefined;
  const edgeLabel = data?.label as string | undefined;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#2563eb' : (conditionId ? '#d97706' : '#64748b'),
        }}
      />

      {/* Invisible thicker path to make hovering and clicking easier */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Label pill if condition or custom label exists */}
          {(edgeLabel || conditionId) && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border shadow-xs select-none transition-colors',
                conditionId
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200',
                selected && 'ring-1 ring-blue-600'
              )}
            >
              {edgeLabel || conditionId}
            </span>
          )}

          {/* Quick delete button visible on hover or selection */}
          {(isHovered || selected) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteEdge(id);
              }}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-400 shadow-xs hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Connection"
              aria-label="Delete Connection"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
