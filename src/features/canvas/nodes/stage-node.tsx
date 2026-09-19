import * as React from "react";
import {
  Handle,
  Position,
  NodeProps,
  NodeResizer,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { ChevronDown, ChevronRight, Plus, Trash2, Layers } from "lucide-react";
import { EditorNodeData } from "@/domain/journey/mapper";
import { getColorScheme } from "@/config/colors";
import { useJourneyStore } from "@/stores/journey-store";
import { useUIStore } from "@/stores/ui-store";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { calculateStageChildrenBounds } from "@/utils/geometry";
import { generateId } from "@/utils/ids";
import { cn } from "@/utils/cn";

export function StageNode({ id, data, selected, width, height }: NodeProps) {
  const nodeData = data as EditorNodeData;
  const colorScheme = getColorScheme(nodeData.color as string);
  const isCollapsed = !!nodeData.isCollapsed;

  const updateNodeInternals = useUpdateNodeInternals();

  React.useEffect(() => {
    updateNodeInternals(id);
    const raf = requestAnimationFrame(() => {
      updateNodeInternals(id);
    });
    return () => cancelAnimationFrame(raf);
  }, [isCollapsed, height, id, updateNodeInternals]);

  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);
  const toggleStageCollapse = useJourneyStore((s) => s.toggleStageCollapse);
  const addNode = useJourneyStore((s) => s.addNode);
  const commitNodeResize = useJourneyStore((s) => s.commitNodeResize);
  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);
  const highlightedNodeId = useUIStore((s) => s.highlightedNodeId);
  const isHighlighted = highlightedNodeId === id;

  // Find all child activities belonging to this stage
  const childActivities = React.useMemo(() => {
    return nodes.filter((n) => n.parentId === id);
  }, [nodes, id]);

  // Calculate strict minimum bounding box constraint based on children
  const childrenBounds = React.useMemo(() => {
    return calculateStageChildrenBounds(
      childActivities.map((c) => ({
        position: c.position,
        width: c.width || 220,
        height: c.height || 76,
      })),
      24,
      56,
      320,
      200,
    );
  }, [childActivities]);

  const handleAddActivity = () => {
    const newActId = generateId("act");
    const existingCount = childActivities.length;
    // Calculate vertical offset inside stage
    const nextY = 64 + existingCount * 96;

    addNode({
      id: newActId,
      type: "activityNode",
      parentId: id,
      position: { x: 24, y: nextY },
      data: {
        title: `Activity ${existingCount + 1}`,
        description: "New process activity",
        category: "verification",
        status: "draft",
        color: nodeData.color || "blue",
      },
      width: 272,
      height: 76,
      style: { width: 272, height: 76 },
    });

    // Auto expand stage if it needs more height
    if ((height || 280) < nextY + 100) {
      commitNodeResize(id, { width: width || 320, height: nextY + 120 });
    }
  };

  const handleDelete = () => {
    const connectedEdges = edges.filter(
      (e) => e.source === id || e.target === id,
    );
    setDeleteConfirm({
      nodeId: id,
      title: `Delete Stage: ${(nodeData.title as string) || ""}`,
      description: `This stage contains ${childActivities.length} activities.`,
      isStageWithChildren: childActivities.length > 0,
      childCount: childActivities.length,
      connectionCount: connectedEdges.length,
    });
  };

  const menuItems = [
    {
      label: "Add Activity",
      icon: <Plus className="h-3.5 w-3.5" />,
      onClick: handleAddActivity,
    },
    {
      label: isCollapsed ? "Expand Stage" : "Collapse Stage",
      icon:
        isCollapsed ?
          <ChevronRight className="h-3.5 w-3.5" />
        : <ChevronDown className="h-3.5 w-3.5" />,
      onClick: () => toggleStageCollapse(id),
    },
    {
      label: "Delete Stage",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <div
      className={cn(
        "group relative rounded-xl border-2 transition-shadow select-none",
        colorScheme.bg,
        colorScheme.border,
        selected ? "ring-2 ring-blue-500 shadow-lg" : "shadow-sm",
        isHighlighted && "ring-4 ring-amber-500 animate-pulse",
        isCollapsed ? "h-14 overflow-hidden" : "h-full",
      )}
      style={{
        width: width ?? 340,
        height: isCollapsed ? 56 : (height ?? 280),
      }}
    >
      {/* NodeResizer for genuine mouse resizing */}
      {!isCollapsed && (
        <NodeResizer
          isVisible={selected}
          minWidth={childrenBounds.minWidth}
          minHeight={childrenBounds.minHeight}
          handleClassName="!w-2.5 !h-2.5 !bg-blue-600 !border-white !border-2 !rounded-xs"
          lineClassName="!border-blue-500 !border-dashed"
          onResizeEnd={(_event, params) => {
            commitNodeResize(
              id,
              {
                width: Math.round(params.width),
                height: Math.round(params.height),
              },
              { x: Math.round(params.x), y: Math.round(params.y) },
            );
          }}
        />
      )}

      {/* Stage Connection Handles on Top, Right, Bottom, Left */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="opacity-0 group-hover:opacity-100 transition-opacity !bg-blue-600"
      />

      {/* Stage Header */}
      <div
        className={cn(
          "flex h-14 items-center justify-between px-3.5 border-b rounded-t-[10px] cursor-grab active:cursor-grabbing",
          colorScheme.headerBg,
          isCollapsed ? "rounded-b-[10px] border-b-0" : "border-slate-200",
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Collapse/Expand Toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleStageCollapse(id);
            }}
            className="rounded p-1 text-slate-500 hover:bg-black/5 hover:text-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Stage" : "Collapse Stage"}
            aria-label={isCollapsed ? "Expand Stage" : "Collapse Stage"}
          >
            {isCollapsed ?
              <ChevronRight className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Stage Number Badge */}
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
              colorScheme.badgeBg,
              colorScheme.badgeText,
            )}
          >
            {nodeData.stageNumber ? `${nodeData.stageNumber}` : "1"}
          </span>

          {/* Stage Title */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-slate-900">
              {nodeData.title || "Untitled Stage"}
            </div>
            {isCollapsed && (
              <div className="text-[10px] text-slate-500 truncate">
                {childActivities.length}{" "}
                {childActivities.length === 1 ? "activity" : "activities"}
              </div>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {!isCollapsed && (
            <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
              {childActivities.length}
            </span>
          )}

          <DropdownMenu
            usePortal={true}
            trigger={
              <button
                type="button"
                className="rounded p-1 text-slate-500 hover:bg-black/5 hover:text-slate-800 transition-colors cursor-pointer z-50"
                aria-label="Stage actions menu"
                title="Stage actions"
              >
                <Plus className="h-4 w-4" />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>

      {/* Expanded Container Body: Drop indicator hint when empty */}
      {!isCollapsed && childActivities.length === 0 && (
        <div className="flex h-[calc(100%-56px)] items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-4 text-center text-slate-400">
            <Layers className="h-5 w-5 mb-1 text-slate-300" />
            <span className="text-[11px] font-medium">
              Drop Activities Here
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Or use stage 3-dot menu
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
