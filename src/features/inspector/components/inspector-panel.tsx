import { ChevronRight, Sliders, X } from "lucide-react";
import { useJourneyStore } from "@/stores/journey-store";
import { useUIStore } from "@/stores/ui-store";
import { EmptyInspector } from "./empty-inspector";
import { StageInspector } from "./stage-inspector";
import { ActivityInspector } from "./activity-inspector";
import { DecisionInspector } from "./decision-inspector";
import { NoteInspector } from "./note-inspector";

export function InspectorPanel() {
  const inspectorOpen = useUIStore((s) => s.inspectorOpen);
  const setInspectorOpen = useUIStore((s) => s.setInspectorOpen);

  const selectedNodeId = useJourneyStore((s) => s.selectedNodeId);
  const selectNode = useJourneyStore((s) => s.selectNode);
  const nodes = useJourneyStore((s) => s.nodes);

  const selectedNode =
    selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  if (!inspectorOpen) {
    return (
      <div className="relative flex flex-col items-center py-2 border-l border-slate-200 bg-white z-10 w-12 shrink-0 select-none">
        <button
          type="button"
          onClick={() => setInspectorOpen(true)}
          className="flex items-center gap-1 rotate-90 origin-center text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap py-2 cursor-pointer"
          title="Open Inspector"
          aria-label="Open Inspector"
        >
          {/* <span>Inspector</span> */}
          <Sliders className="h-4 w-4 rotate-90" />
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (!selectedNode) {
      return <EmptyInspector />;
    }

    switch (selectedNode.type) {
      case "stageNode":
        return <StageInspector node={selectedNode} />;
      case "activityNode":
        return <ActivityInspector node={selectedNode} />;
      case "decisionNode":
        return <DecisionInspector node={selectedNode} />;
      case "noteNode":
        return <NoteInspector node={selectedNode} />;
      default:
        return <EmptyInspector />;
    }
  };

  const getHeaderTitle = () => {
    if (!selectedNode) return "Properties";
    switch (selectedNode.type) {
      case "stageNode":
        return "Stage Inspector";
      case "activityNode":
        return "Activity Inspector";
      case "decisionNode":
        return "Decision Inspector";
      case "noteNode":
        return "Note Inspector";
      default:
        return "Inspector";
    }
  };

  return (
    <aside className="relative flex w-80 flex-col border-l border-slate-200 bg-white shrink-0 select-none z-10">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {getHeaderTitle()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedNode && (
            <button
              type="button"
              onClick={() => selectNode(null)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setInspectorOpen(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Collapse Inspector"
            aria-label="Collapse Inspector"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </aside>
  );
}
