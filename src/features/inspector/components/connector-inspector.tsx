import { ArrowRight, Trash2, GitBranch } from "lucide-react";
import { EditorEdge } from "@/domain/journey/mapper";
import { useJourneyStore } from "@/stores/journey-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ConnectorInspectorProps {
  edge: EditorEdge;
}

export function ConnectorInspector({ edge }: ConnectorInspectorProps) {
  const updateEdgeLabel = useJourneyStore((s) => s.updateEdgeLabel);
  const deleteEdge = useJourneyStore((s) => s.deleteEdge);
  const nodes = useJourneyStore((s) => s.nodes);

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  const label = edge.data?.label || "";
  const conditionId = edge.data?.conditionId;

  return (
    <div className="space-y-5 p-4 text-xs select-none">
      {/* Connector Name / Label */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Connector Name / Label
        </label>
        <Input
          value={label}
          onChange={(e) => updateEdgeLabel(edge.id, e.target.value)}
          placeholder={
            conditionId ?
              `Branch: ${conditionId}`
            : "e.g. Approved, Next Step..."
          }
        />
        <p className="mt-1 text-[11px] text-slate-400">
          This label displays on the connector arrow in the canvas.
        </p>
      </div>

      {/* Connection Path Overview */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Connection Flow
        </div>

        <div className="flex items-center gap-2">
          {/* Source Node */}
          <div className="flex-1 min-w-0 rounded-md bg-white border border-slate-200 p-2">
            <div className="text-[10px] uppercase font-semibold text-slate-400 truncate">
              {sourceNode?.type?.replace("Node", "") || "Source"}
            </div>
            <div
              className="text-xs font-medium text-slate-800 truncate"
              title={(sourceNode?.data?.title as string) || edge.source}
            >
              {(sourceNode?.data?.title as string) || edge.source}
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />

          {/* Target Node */}
          <div className="flex-1 min-w-0 rounded-md bg-white border border-slate-200 p-2">
            <div className="text-[10px] uppercase font-semibold text-slate-400 truncate">
              {targetNode?.type?.replace("Node", "") || "Target"}
            </div>
            <div
              className="text-xs font-medium text-slate-800 truncate"
              title={(targetNode?.data?.title as string) || edge.target}
            >
              {(targetNode?.data?.title as string) || edge.target}
            </div>
          </div>
        </div>

        {/* Condition details if present */}
        {conditionId && (
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-700 bg-amber-50/80 px-2 py-1 rounded border border-amber-200">
            <GitBranch className="h-3 w-3 shrink-0" />
            <span className="truncate">
              Decision Branch: <strong>{conditionId}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Delete Action */}
      <div className="pt-2 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => deleteEdge(edge.id)}
          className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-1.5 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Connector</span>
        </Button>
      </div>
    </div>
  );
}
