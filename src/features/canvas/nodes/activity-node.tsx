import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import {
  CheckCircle2,
  FileText,
  ShieldAlert,
  Send,
  Headphones,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { EditorNodeData } from '@/domain/journey/mapper';
import { getColorScheme } from '@/config/colors';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/utils/cn';

export function ActivityNode({ id, data, selected, parentId, width, height }: NodeProps) {
  const nodeData = data as EditorNodeData;
  const colorScheme = getColorScheme(nodeData.color as string);

  const isInsideStage = !!parentId;
  const commitNodeResize = useJourneyStore((s) => s.commitNodeResize);
  const edges = useJourneyStore((s) => s.edges);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);
  const highlightedNodeId = useUIStore((s) => s.highlightedNodeId);
  const isHighlighted = highlightedNodeId === id;

  const getCategoryIcon = () => {
    switch (nodeData.category) {
      case 'verification':
        return <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />;
      case 'documentation':
        return <FileText className="h-3.5 w-3.5 text-amber-600" />;
      case 'underwriting':
        return <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />;
      case 'disbursement':
        return <Send className="h-3.5 w-3.5 text-emerald-600" />;
      case 'servicing':
        return <Headphones className="h-3.5 w-3.5 text-cyan-600" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const connectedEdges = edges.filter((edge) => edge.source === id || edge.target === id);
    setDeleteConfirm({
      nodeId: id,
      title: `Delete Activity: ${(nodeData.title as string) || ''}`,
      description: 'Are you sure you want to remove this activity from the journey?',
      connectionCount: connectedEdges.length,
    });
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-lg border bg-white p-3 shadow-xs transition-all select-none',
        colorScheme.borderHover,
        selected ? 'border-blue-600 ring-2 ring-blue-500/40 shadow-md' : 'border-slate-200',
        isHighlighted && 'ring-4 ring-amber-500 animate-pulse',
        isInsideStage ? 'cursor-grab active:cursor-grabbing' : 'cursor-move'
      )}
      style={{
        width: width ?? 272,
        height: height ?? 76,
      }}
    >
      {/* NodeResizer for genuine mouse resizing */}
      <NodeResizer
        isVisible={selected}
        minWidth={180}
        minHeight={60}
        handleClassName="!w-2 !h-2 !bg-blue-600 !border-white !border !rounded-xs"
        lineClassName="!border-blue-400 !border-dashed"
        onResizeEnd={(_event, params) => {
          commitNodeResize(
            id,
            { width: Math.round(params.width), height: Math.round(params.height) },
            { x: Math.round(params.x), y: Math.round(params.y) }
          );
        }}
      />

      {/* Handles only appear for independent activities (outside a stage) */}
      {!isInsideStage && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
          />
        </>
      )}

      {/* Card Content */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="shrink-0 p-0.5 rounded bg-slate-50 border border-slate-100">
            {getCategoryIcon()}
          </div>
          <span className="truncate text-xs font-bold text-slate-800">
            {nodeData.title || 'Untitled Activity'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
          title="Delete Activity"
          aria-label="Delete Activity"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">
        {nodeData.description || 'Process activity step'}
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span className="capitalize">{typeof nodeData.category === 'string' ? nodeData.category : 'General'}</span>
        <span
          className={cn(
            'inline-flex items-center px-1 rounded font-medium',
            nodeData.status === 'completed'
              ? 'bg-emerald-50 text-emerald-700'
              : nodeData.status === 'in_progress'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-slate-100 text-slate-600'
          )}
        >
          {typeof nodeData.status === 'string' ? nodeData.status.replace('_', ' ') : 'draft'}
        </span>
      </div>
    </div>
  );
}
