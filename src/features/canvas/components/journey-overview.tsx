import { useReactFlow } from '@xyflow/react';
import { X, Layers, GitBranch, Activity, ChevronRight } from 'lucide-react';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';
import { EditorNode } from '@/domain/journey/mapper';

export function JourneyOverview() {
  const { setCenter } = useReactFlow();

  const overviewOpen = useUIStore((s) => s.overviewOpen);
  const setOverviewOpen = useUIStore((s) => s.setOverviewOpen);
  const setHighlightedNodeId = useUIStore((s) => s.setHighlightedNodeId);
  const setInspectorOpen = useUIStore((s) => s.setInspectorOpen);

  const nodes = useJourneyStore((s) => s.nodes);
  const selectNode = useJourneyStore((s) => s.selectNode);

  if (!overviewOpen) return null;

  // Major nodes only: Stages, Decisions, Independent Activities (no nested activities)
  const majorNodes = nodes.filter(
    (n) =>
      n.type === 'stageNode' ||
      n.type === 'decisionNode' ||
      (n.type === 'activityNode' && !n.parentId)
  );

  const handleCardClick = (node: EditorNode) => {
    selectNode(node.id);
    setInspectorOpen(true);
    setHighlightedNodeId(node.id);

    const w = node.width ?? 280;
    const h = node.height ?? 180;
    setCenter(node.position.x + w / 2, node.position.y + h / 2, {
      zoom: 1.0,
      duration: 400,
    });

    setTimeout(() => {
      setHighlightedNodeId(null);
    }, 2500);
  };

  const getNodeIcon = (type?: string) => {
    switch (type) {
      case 'stageNode':
        return <Layers className="h-4 w-4 text-blue-600" />;
      case 'decisionNode':
        return <GitBranch className="h-4 w-4 text-amber-600" />;
      case 'activityNode':
        return <Activity className="h-4 w-4 text-indigo-600" />;
      default:
        return <Layers className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-5xl rounded-xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xs select-none animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Journey Navigation Overview
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-600">
            {majorNodes.length} Major Components
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOverviewOpen(false)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          title="Close Journey Overview"
          aria-label="Close Journey Overview"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Horizontally scrollable cards */}
      <div className="mt-2.5 flex items-center gap-3 overflow-x-auto pb-1">
        {majorNodes.length === 0 ? (
          <div className="py-4 text-xs text-slate-400 text-center w-full">
            No major milestones or decision points on canvas yet.
          </div>
        ) : (
          majorNodes.map((node, index) => {
            const childCount =
              node.type === 'stageNode'
                ? nodes.filter((n) => n.parentId === node.id).length
                : 0;

            const conditions = (node.data.conditions as unknown[]) || [];

            return (
              <div
                key={node.id}
                onClick={() => handleCardClick(node)}
                className="group relative flex min-w-[210px] max-w-[210px] shrink-0 flex-col justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="p-1 rounded bg-slate-50 border border-slate-100 shrink-0">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="truncate text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {node.data.title || 'Untitled'}
                    </span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
                  <span className="font-mono text-slate-400">#{index + 1}</span>
                  {node.type === 'stageNode' && (
                    <span>{childCount} {childCount === 1 ? 'activity' : 'activities'}</span>
                  )}
                  {node.type === 'decisionNode' && (
                    <span className="text-amber-700">{conditions.length} branches</span>
                  )}
                  {node.type === 'activityNode' && (
                    <span className="text-indigo-700">Independent</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
