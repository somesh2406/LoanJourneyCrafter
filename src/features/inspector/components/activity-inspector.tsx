import { Trash2 } from 'lucide-react';
import { EditorNode } from '@/domain/journey/mapper';
import { ActivityCategory, JourneyNodeStatus } from '@/domain/nodes/types';
import { ThemeColor } from '@/config/colors';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from './color-palette-picker';

export interface ActivityInspectorProps {
  node: EditorNode;
}

export function ActivityInspector({ node }: ActivityInspectorProps) {
  const updateNodeData = useJourneyStore((s) => s.updateNodeData);
  const commitNodeResize = useJourneyStore((s) => s.commitNodeResize);
  const reparentActivity = useJourneyStore((s) => s.reparentActivity);
  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);

  const data = node.data;
  const stages = nodes.filter((n) => n.type === 'stageNode');

  const handleDelete = () => {
    const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
    setDeleteConfirm({
      nodeId: node.id,
      title: `Delete Activity: ${(data.title as string) || ''}`,
      description: 'Are you sure you want to remove this activity from the loan journey?',
      connectionCount: connectedEdges.length,
    });
  };

  const handleParentChange = (newParentId: string) => {
    const targetParentId = newParentId === '__NONE__' ? null : newParentId;
    if (targetParentId === (node.parentId || null)) return;

    if (targetParentId) {
      // Find target stage
      const targetStage = stages.find((s) => s.id === targetParentId);
      if (targetStage) {
        // Position inside stage
        const existingInStage = nodes.filter((n) => n.parentId === targetParentId);
        const nextY = 64 + existingInStage.length * 96;
        reparentActivity(node.id, targetParentId, { x: 24, y: nextY });
      }
    } else {
      // Move to root canvas
      const currentParent = stages.find((s) => s.id === node.parentId);
      const absX = currentParent ? currentParent.position.x + node.position.x : node.position.x;
      const absY = currentParent ? currentParent.position.y + node.position.y : node.position.y;
      reparentActivity(node.id, null, { x: absX, y: absY });
    }
  };

  return (
    <div className="space-y-4 p-4 text-xs select-none">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Activity Title
        </label>
        <Input
          value={(data.title as string) || ''}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="e.g. Identity Document Extraction"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Description
        </label>
        <Textarea
          value={(data.description as string) || ''}
          onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
          placeholder="Detailed operational task description..."
          rows={2}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Process Category
        </label>
        <select
          value={(data.category as string) || 'verification'}
          onChange={(e) =>
            updateNodeData(node.id, { category: e.target.value as ActivityCategory })
          }
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
        >
          <option value="verification">Verification & KYC</option>
          <option value="documentation">Documentation & Legal</option>
          <option value="underwriting">Credit Underwriting</option>
          <option value="disbursement">Disbursement & Payout</option>
          <option value="servicing">Servicing & Mandate</option>
          <option value="custom">Custom Task</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Execution Status
        </label>
        <select
          value={(data.status as string) || 'draft'}
          onChange={(e) =>
            updateNodeData(node.id, { status: e.target.value as JourneyNodeStatus })
          }
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
        >
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review Required</option>
          <option value="completed">Completed</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      {/* Parent Stage Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Parent Stage Container
        </label>
        <select
          value={node.parentId || '__NONE__'}
          onChange={(e) => handleParentChange(e.target.value)}
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
        >
          <option value="__NONE__">Independent (Outside Stage)</option>
          {stages.map((stg) => (
            <option key={stg.id} value={stg.id}>
              Stage: {(stg.data.title as string) || 'Untitled'}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-slate-400">
          Changing parent automatically converts coordinates with zero jump.
        </p>
      </div>

      {/* Color Palette */}
      <ColorPalettePicker
        selectedColor={(data.color as string) || 'blue'}
        onChange={(color: ThemeColor) => updateNodeData(node.id, { color })}
      />

      {/* Dimensions */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Dimensions
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Width (px)</label>
            <Input
              type="number"
              value={Math.round((node.width as number) || 272)}
              onChange={(e) => {
                const w = parseInt(e.target.value, 10);
                if (!isNaN(w) && w >= 180) {
                  commitNodeResize(node.id, { width: w, height: (node.height as number) || 76 });
                }
              }}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Height (px)</label>
            <Input
              type="number"
              value={Math.round((node.height as number) || 76)}
              onChange={(e) => {
                const h = parseInt(e.target.value, 10);
                if (!isNaN(h) && h >= 60) {
                  commitNodeResize(node.id, { width: (node.width as number) || 272, height: h });
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Delete button */}
      <div className="pt-4 border-t border-slate-200">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="w-full gap-1.5 text-xs cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Activity</span>
        </Button>
      </div>
    </div>
  );
}
