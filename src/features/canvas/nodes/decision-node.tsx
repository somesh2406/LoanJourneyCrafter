import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { EditorNodeData } from '@/domain/journey/mapper';
import { Condition } from '@/domain/nodes/types';
import { getColorScheme } from '@/config/colors';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { generateId } from '@/utils/ids';
import { cn } from '@/utils/cn';

export function DecisionNode({ id, data, selected, width, height }: NodeProps) {
  const nodeData = data as EditorNodeData;
  const colorScheme = getColorScheme((nodeData.color as string) || 'amber');
  const conditions = ((nodeData.conditions as Condition[]) || []);

  const commitNodeResize = useJourneyStore((s) => s.commitNodeResize);
  const addCondition = useJourneyStore((s) => s.addCondition);
  const edges = useJourneyStore((s) => s.edges);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);
  const highlightedNodeId = useUIStore((s) => s.highlightedNodeId);
  const isHighlighted = highlightedNodeId === id;

  const handleAddCondition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCondId = generateId('cond');
    addCondition(id, {
      id: newCondId,
      label: `Branch ${conditions.length + 1}`,
      expression: '',
      description: 'Conditional branch',
    });

    // Auto-adjust height if conditions grow
    const neededHeight = 120 + (conditions.length + 1) * 36;
    if ((height || 180) < neededHeight) {
      commitNodeResize(id, { width: width || 260, height: neededHeight });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const connectedEdges = edges.filter((edge) => edge.source === id || edge.target === id);
    setDeleteConfirm({
      nodeId: id,
      title: `Delete Decision: ${(data.title as string) || ''}`,
      description: `This decision node has ${conditions.length} branches.`,
      connectionCount: connectedEdges.length,
    });
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border-2 bg-white shadow-sm transition-all select-none',
        colorScheme.border,
        selected ? 'border-amber-600 ring-2 ring-amber-500/40 shadow-md' : 'border-amber-300',
        isHighlighted && 'ring-4 ring-amber-500 animate-pulse'
      )}
      style={{
        width: width ?? 260,
        height: height ?? Math.max(160, 90 + conditions.length * 36),
      }}
    >
      {/* NodeResizer */}
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={140}
        handleClassName="!w-2.5 !h-2.5 !bg-amber-600 !border-white !border-2 !rounded-xs"
        lineClassName="!border-amber-400 !border-dashed"
        onResizeEnd={(_event, params) => {
          commitNodeResize(
            id,
            { width: Math.round(params.width), height: Math.round(params.height) },
            { x: Math.round(params.x), y: Math.round(params.y) }
          );
        }}
      />

      {/* Target Handles: Incoming connections from Left and Top */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-amber-600 !w-2.5 !h-2.5"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="opacity-0 group-hover:opacity-100 transition-opacity !bg-amber-600 !w-2.5 !h-2.5"
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/70 px-3.5 py-2.5 rounded-t-[10px]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white shadow-xs">
            <GitBranch className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-slate-900">
              {nodeData.title || 'Decision Point'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleAddCondition}
            className="rounded p-1 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Add Condition Branch"
            aria-label="Add Condition Branch"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Delete Decision"
            aria-label="Delete Decision"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Conditions list or zero-condition fallback */}
      <div className="flex-1 p-2.5 space-y-1.5 overflow-y-auto">
        {conditions.length === 0 ? (
          <div className="relative flex h-full items-center justify-between rounded-md border border-dashed border-amber-200 bg-amber-50/30 px-3 py-2 text-xs text-amber-800">
            <span>Default branch (0 conditions)</span>
            {/* General decision output handle when zero conditions */}
            <Handle
              type="source"
              position={Position.Right}
              id="default-output"
              className="!bg-amber-600 !w-2.5 !h-2.5 -right-3"
            />
          </div>
        ) : (
          conditions.map((cond, index) => {
            const handleId = `condition-${cond.id}`;
            const isConnected = edges.some(
              (e) => e.source === id && (e.sourceHandle === handleId || e.data?.conditionId === cond.id)
            );

            return (
              <div
                key={cond.id}
                className={cn(
                  'relative flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                  isConnected
                    ? 'border-amber-300 bg-amber-50/60 font-semibold text-amber-900'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-500 border border-slate-200">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium">{cond.label}</span>
                </div>

                {/* Independent outgoing handle for this specific condition */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={handleId}
                  title={`Connect: ${cond.label}`}
                  className={cn(
                    '!w-2.5 !h-2.5 -right-3 transition-transform',
                    isConnected ? '!bg-amber-600' : '!bg-slate-400 hover:!bg-amber-600'
                  )}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 rounded-b-[10px] text-[10px] text-slate-400 flex items-center justify-between">
        <span>{conditions.length} condition {conditions.length === 1 ? 'branch' : 'branches'}</span>
        <span className="text-amber-700 font-mono">◇ Decision</span>
      </div>
    </div>
  );
}
