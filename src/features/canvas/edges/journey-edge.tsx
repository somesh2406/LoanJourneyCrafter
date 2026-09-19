import * as React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { X, Pencil } from "lucide-react";
import { useJourneyStore } from "@/stores/journey-store";
import { cn } from "@/utils/cn";

export function JourneyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const deleteEdge = useJourneyStore((s) => s.deleteEdge);
  const updateEdgeLabel = useJourneyStore((s) => s.updateEdgeLabel);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  const conditionId = data?.conditionId as string | undefined;
  const edgeLabel = data?.label as string | undefined;
  const [editValue, setEditValue] = React.useState("");

  const startEditing = () => {
    setEditValue(edgeLabel || conditionId || "");
    setIsEditing(true);
  };

  const handleCommitLabel = () => {
    setIsEditing(false);
    updateEdgeLabel(id, editValue);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke:
            selected ? "#2563eb"
            : conditionId ? "#d97706"
            : "#64748b",
        }}
      />

      {/* Invisible thicker path to make hovering and clicking easier */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ?
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleCommitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCommitLabel();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditValue(edgeLabel || conditionId || "");
                }
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border border-blue-600 bg-white text-slate-900 shadow-xs outline-hidden ring-1 ring-blue-600 w-28 text-center"
            />
          : <>
              {/* Label pill if condition or custom label exists */}
              {(edgeLabel || conditionId) && (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditing();
                  }}
                  title="Double-click to rename connector"
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border shadow-xs select-none transition-colors cursor-pointer",
                    conditionId ?
                      "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-white text-slate-700 border-slate-200",
                    selected && "ring-1 ring-blue-600",
                  )}
                >
                  {edgeLabel || conditionId}
                </span>
              )}

              {/* Add Name button when no label exists and connector is hovered or selected */}
              {!edgeLabel && !conditionId && (isHovered || selected) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing();
                  }}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium border border-dashed border-slate-300 bg-white/95 text-slate-500 hover:text-blue-600 hover:border-blue-400 shadow-xs select-none transition-colors cursor-pointer"
                  title="Click to name connector"
                >
                  + Add Name
                </button>
              )}

              {/* Quick rename button visible on hover or selection when label exists */}
              {(edgeLabel || conditionId) && (isHovered || selected) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing();
                  }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-400 shadow-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Rename Connection"
                  aria-label="Rename Connection"
                >
                  <Pencil className="h-2 w-2" />
                </button>
              )}

              {/* Quick delete button visible on hover or selection */}
              {(isHovered || selected) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEdge(id);
                  }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-400 shadow-xs hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Connection"
                  aria-label="Delete Connection"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </>
          }
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
