import { Trash2 } from 'lucide-react';
import { EditorNode } from '@/domain/journey/mapper';
import { JourneyNodeStatus } from '@/domain/nodes/types';
import { ThemeColor } from '@/config/colors';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from './color-palette-picker';

export interface StageInspectorProps {
  node: EditorNode;
}

export function StageInspector({ node }: StageInspectorProps) {
  const updateNodeData = useJourneyStore((s) => s.updateNodeData);
  const commitNodeResize = useJourneyStore((s) => s.commitNodeResize);
  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);

  const data = node.data;
  const childActivities = nodes.filter((n) => n.parentId === node.id);

  const handleDelete = () => {
    const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
    setDeleteConfirm({
      nodeId: node.id,
      title: `Delete Stage: ${(data.title as string) || ''}`,
      description: `This stage contains ${childActivities.length} activities.`,
      isStageWithChildren: childActivities.length > 0,
      childCount: childActivities.length,
      connectionCount: connectedEdges.length,
    });
  };

  const handleWidthChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 280) {
      commitNodeResize(node.id, { width: num, height: (node.height as number) || 280 });
    }
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 160) {
      commitNodeResize(node.id, { width: (node.width as number) || 340, height: num });
    }
  };

  return (
    <div className="space-y-4 p-4 text-xs select-none">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Stage Title
        </label>
        <Input
          value={(data.title as string) || ''}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="e.g. KYC & Underwriting"
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
          placeholder="Objective of this journey milestone..."
          rows={2}
        />
      </div>

      {/* Identifier & Stage Number */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Identifier
          </label>
          <Input
            value={(data.identifier as string) || ''}
            onChange={(e) => updateNodeData(node.id, { identifier: e.target.value })}
            placeholder="e.g. STAGE_KYC"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Stage #
          </label>
          <Input
            type="number"
            min={1}
            value={(data.stageNumber as number) ?? 1}
            onChange={(e) =>
              updateNodeData(node.id, { stageNumber: parseInt(e.target.value, 10) || 1 })
            }
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Lifecycle Status
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
          <option value="review">Under Review</option>
          <option value="completed">Completed</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      {/* Color Palette */}
      <ColorPalettePicker
        selectedColor={(data.color as string) || 'blue'}
        onChange={(color: ThemeColor) => updateNodeData(node.id, { color })}
      />

      {/* Dimensions & Position */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Geometry & Layout
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Width (px)</label>
            <Input
              type="number"
              value={Math.round((node.width as number) || 340)}
              onChange={(e) => handleWidthChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Height (px)</label>
            <Input
              type="number"
              value={Math.round((node.height as number) || 280)}
              onChange={(e) => handleHeightChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded bg-slate-50 p-2 text-[11px] text-slate-600">
          <span>Position (X, Y):</span>
          <span className="font-mono font-medium">
            {Math.round(node.position.x)}, {Math.round(node.position.y)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded bg-slate-50 p-2 text-[11px] text-slate-600">
          <span>Nested Activities:</span>
          <span className="font-bold text-slate-900">{childActivities.length}</span>
        </div>
      </div>

      {/* Delete Stage button */}
      <div className="pt-4 border-t border-slate-200">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="w-full gap-1.5 text-xs cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Stage</span>
        </Button>
      </div>
    </div>
  );
}
