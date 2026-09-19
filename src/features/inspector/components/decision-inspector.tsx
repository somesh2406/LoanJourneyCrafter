import { Plus, Trash2, GitBranch } from 'lucide-react';
import { EditorNode } from '@/domain/journey/mapper';
import { Condition } from '@/domain/nodes/types';
import { ThemeColor } from '@/config/colors';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from './color-palette-picker';
import { generateId } from '@/utils/ids';

export interface DecisionInspectorProps {
  node: EditorNode;
}

export function DecisionInspector({ node }: DecisionInspectorProps) {
  const updateNodeData = useJourneyStore((s) => s.updateNodeData);
  const addCondition = useJourneyStore((s) => s.addCondition);
  const updateCondition = useJourneyStore((s) => s.updateCondition);
  const removeCondition = useJourneyStore((s) => s.removeCondition);
  const edges = useJourneyStore((s) => s.edges);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);

  const data = node.data;
  const conditions = ((data.conditions as Condition[]) || []);

  const handleAdd = () => {
    const newCondId = generateId('cond');
    addCondition(node.id, {
      id: newCondId,
      label: `Branch ${conditions.length + 1}`,
      expression: '',
      description: 'Condition expression',
    });
  };

  const handleDelete = () => {
    const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);
    setDeleteConfirm({
      nodeId: node.id,
      title: `Delete Decision: ${(data.title as string) || ''}`,
      description: `This decision node has ${conditions.length} branch conditions.`,
      connectionCount: connectedEdges.length,
    });
  };

  return (
    <div className="space-y-4 p-4 text-xs select-none">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Decision Point Title
        </label>
        <Input
          value={(data.title as string) || ''}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="e.g. Risk Appetite Decision"
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
          placeholder="Explain the branching rules evaluated here..."
          rows={2}
        />
      </div>

      {/* Color Palette */}
      <ColorPalettePicker
        selectedColor={(data.color as string) || 'amber'}
        onChange={(color: ThemeColor) => updateNodeData(node.id, { color })}
      />

      {/* Conditions list */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <GitBranch className="h-3.5 w-3.5 text-amber-600" />
            <span>Branch Conditions ({conditions.length})</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="gap-1 text-[11px] h-7 px-2 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Add Branch</span>
          </Button>
        </div>

        {conditions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-slate-400 text-[11px]">
            No branch conditions yet. The decision will have a single default output connector.
          </div>
        ) : (
          <div className="space-y-3">
            {conditions.map((cond, idx) => (
              <div
                key={cond.id}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">
                    Branch #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCondition(node.id, cond.id)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove condition"
                    aria-label="Remove condition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Label</label>
                  <Input
                    value={cond.label}
                    onChange={(e) =>
                      updateCondition(node.id, cond.id, { label: e.target.value })
                    }
                    placeholder="e.g. Approved"
                    className="h-7 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">
                    Rule Expression
                  </label>
                  <Input
                    value={cond.expression}
                    onChange={(e) =>
                      updateCondition(node.id, cond.id, { expression: e.target.value })
                    }
                    placeholder="e.g. score >= 700"
                    className="h-7 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">
                    Description (Optional)
                  </label>
                  <Input
                    value={cond.description || ''}
                    onChange={(e) =>
                      updateCondition(node.id, cond.id, { description: e.target.value })
                    }
                    placeholder="e.g. Tier 1 instant approval"
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Decision button */}
      <div className="pt-4 border-t border-slate-200">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          className="w-full gap-1.5 text-xs cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Decision</span>
        </Button>
      </div>
    </div>
  );
}
