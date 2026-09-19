import { NodeProps, NodeResizer } from '@xyflow/react';
import { StickyNote, Trash2 } from 'lucide-react';
import { EditorNodeData } from '@/domain/journey/mapper';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/utils/cn';

export function NoteNode({ id, data, selected, width, height }: NodeProps) {
  const nodeData = data as EditorNodeData;
  const color = (nodeData.color as string) || 'amber';

  const commitNodeResize = useJourneyStore((s) => s.commitNodeResize);
  const deleteNode = useJourneyStore((s) => s.deleteNode);
  const highlightedNodeId = useUIStore((s) => s.highlightedNodeId);
  const isHighlighted = highlightedNodeId === id;

  const colorStyles: Record<string, { bg: string; border: string; text: string; header: string }> = {
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      header: 'text-amber-800',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      header: 'text-blue-800',
    },
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      header: 'text-emerald-800',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-900',
      header: 'text-purple-800',
    },
    neutral: {
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-900',
      header: 'text-slate-700',
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.amber;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border-2 p-3.5 shadow-sm transition-all select-none',
        currentStyle.bg,
        currentStyle.border,
        selected ? 'ring-2 ring-blue-500 shadow-md' : 'shadow-xs',
        isHighlighted && 'ring-4 ring-amber-500 animate-pulse'
      )}
      style={{
        width: width ?? 220,
        height: height ?? 140,
      }}
    >
      {/* NodeResizer */}
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        handleClassName="!w-2 !h-2 !bg-slate-700 !border-white !border !rounded-xs"
        lineClassName="!border-slate-400 !border-dashed"
        onResizeEnd={(_event, params) => {
          commitNodeResize(
            id,
            { width: Math.round(params.width), height: Math.round(params.height) },
            { x: Math.round(params.x), y: Math.round(params.y) }
          );
        }}
      />

      {/* Note Header */}
      <div className="flex items-center justify-between border-b border-black/5 pb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <StickyNote className={cn('h-3.5 w-3.5 shrink-0', currentStyle.header)} />
          <span className={cn('truncate text-xs font-bold tracking-tight', currentStyle.header)}>
            {nodeData.title || 'Annotation Note'}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-opacity cursor-pointer"
          title="Delete Note"
          aria-label="Delete Note"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Note Body */}
      <div className="mt-2 flex-1 overflow-y-auto text-xs leading-relaxed">
        <p className={cn('whitespace-pre-wrap', currentStyle.text)}>
          {(nodeData.content as string) || 'Write journey notes, policy reminders, or operational instructions here.'}
        </p>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 text-right font-mono">
        Note
      </div>
    </div>
  );
}
