import { Trash2 } from 'lucide-react';
import { EditorNode } from '@/domain/journey/mapper';
import { ThemeColor } from '@/config/colors';
import { useJourneyStore } from '@/stores/journey-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from './color-palette-picker';

export interface NoteInspectorProps {
  node: EditorNode;
}

export function NoteInspector({ node }: NoteInspectorProps) {
  const updateNodeData = useJourneyStore((s) => s.updateNodeData);
  const commitNodeResize = useJourneyStore((s) => s.commitNodeResize);
  const deleteNode = useJourneyStore((s) => s.deleteNode);

  const data = node.data;

  return (
    <div className="space-y-4 p-4 text-xs select-none">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Note Title
        </label>
        <Input
          value={(data.title as string) || ''}
          onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
          placeholder="e.g. Underwriting Policy Reminder"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Annotation Content
        </label>
        <Textarea
          value={(data.content as string) || ''}
          onChange={(e) => updateNodeData(node.id, { content: e.target.value })}
          placeholder="Type your journey notes, instructions, or regulatory links here..."
          rows={5}
        />
      </div>

      {/* Color Palette */}
      <ColorPalettePicker
        selectedColor={(data.color as string) || 'amber'}
        onChange={(color: ThemeColor) => updateNodeData(node.id, { color })}
      />

      {/* Dimensions */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Size
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Width (px)</label>
            <Input
              type="number"
              value={Math.round((node.width as number) || 220)}
              onChange={(e) => {
                const w = parseInt(e.target.value, 10);
                if (!isNaN(w) && w >= 160) {
                  commitNodeResize(node.id, { width: w, height: (node.height as number) || 140 });
                }
              }}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Height (px)</label>
            <Input
              type="number"
              value={Math.round((node.height as number) || 140)}
              onChange={(e) => {
                const h = parseInt(e.target.value, 10);
                if (!isNaN(h) && h >= 100) {
                  commitNodeResize(node.id, { width: (node.width as number) || 220, height: h });
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
          onClick={() => deleteNode(node.id)}
          className="w-full gap-1.5 text-xs cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Note</span>
        </Button>
      </div>
    </div>
  );
}
