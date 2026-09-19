import { MiniMap, type Node as FlowNode } from '@xyflow/react';
import { X, MapPin } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { EditorNode } from '@/domain/journey/mapper';

export function GlanceView() {
  const glanceOpen = useUIStore((s) => s.glanceOpen);
  const setGlanceOpen = useUIStore((s) => s.setGlanceOpen);

  const nodeColor = (node: FlowNode) => {
    const editorNode = node as EditorNode;
    switch (editorNode.type) {
      case 'stageNode':
        return '#bfdbfe'; // blue-200
      case 'activityNode':
        return '#3b82f6'; // blue-500
      case 'decisionNode':
        return '#f59e0b'; // amber-500
      case 'noteNode':
        return '#fde68a'; // amber-200
      default:
        return '#cbd5e1';
    }
  };

  const nodeStrokeColor = (node: FlowNode) => {
    const editorNode = node as EditorNode;
    switch (editorNode.type) {
      case 'stageNode':
        return '#2563eb';
      case 'activityNode':
        return '#1d4ed8';
      case 'decisionNode':
        return '#b45309';
      case 'noteNode':
        return '#d97706';
      default:
        return '#94a3b8';
    }
  };

  if (!glanceOpen) {
    return (
      <button
        type="button"
        onClick={() => setGlanceOpen(true)}
        className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
        title="Reopen Glance View"
        aria-label="Reopen Glance View"
      >
        <MapPin className="h-3.5 w-3.5 text-blue-600" />
        <span>Glance view</span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-6 right-6 z-20 flex flex-col rounded-xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-xs select-none w-56">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-slate-100 mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
          Glance view
        </span>
        <button
          type="button"
          onClick={() => setGlanceOpen(false)}
          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          title="Close Glance View"
          aria-label="Close Glance View"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Synchronized XYFlow MiniMap */}
      <div className="h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 relative">
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeColor={nodeStrokeColor}
          nodeStrokeWidth={2}
          nodeBorderRadius={4}
          maskColor="rgba(241, 245, 249, 0.7)"
          pannable
          zoomable
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            margin: 0,
            bottom: 'auto',
            right: 'auto',
          }}
        />
      </div>
    </div>
  );
}
