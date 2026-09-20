import {
  Pin,
  PinOff,
  Calendar,
  GitFork,
  Activity,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { MindmapSummary } from "@/domain/mindmap/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface MindmapCardProps {
  mindmap: MindmapSummary;
  onOpen: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MindmapCard({
  mindmap,
  onOpen,
  onTogglePin,
  onDelete,
}: MindmapCardProps) {
  const formattedDate = new Date(mindmap.updatedAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="purple"
              className="bg-indigo-50 text-indigo-700 border-indigo-200"
            >
              MindMap
            </Badge>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-600">
              Tree
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(mindmap.id);
              }}
              title={mindmap.isPinned ? "Unpin MindMap" : "Pin MindMap"}
              aria-label={mindmap.isPinned ? "Unpin MindMap" : "Pin MindMap"}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {mindmap.isPinned ?
                <Pin className="h-4 w-4 fill-indigo-600 text-indigo-600" />
              : <PinOff className="h-4 w-4" />}
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(mindmap.id);
                }}
                title="Delete MindMap"
                aria-label="Delete MindMap"
                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-3">
          <h3
            onClick={() => onOpen(mindmap.id)}
            className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
          >
            {mindmap.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
            {mindmap.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Metrics & Actions Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1" title="Main branches">
            <GitFork className="h-3.5 w-3.5 text-indigo-500" />
            <span>
              {mindmap.branchCount}{" "}
              {mindmap.branchCount === 1 ? "branch" : "branches"}
            </span>
          </span>
          <span className="flex items-center gap-1" title="Total nodes">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {mindmap.nodeCount} {mindmap.nodeCount === 1 ? "node" : "nodes"}
            </span>
          </span>
          <span
            className="hidden sm:flex items-center gap-1"
            title="Last updated"
          >
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => onOpen(mindmap.id)}
          className="gap-1 text-xs px-2.5 py-1 h-7 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <span>Open</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
