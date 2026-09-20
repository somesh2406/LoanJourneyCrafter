import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { useMindmapStore } from "@/stores/mindmap-store";
import { MindmapFlowNode } from "../utils/tree-layout";
import { RichContentRenderer } from "./rich-content-renderer";
import { cn } from "@/utils/cn";

export function MindmapNode({ data, selected }: NodeProps<MindmapFlowNode>) {
  const {
    id,
    label,
    isRoot,
    depth,
    color,
    collapsed,
    childCount,
    hasChildren,
    content,
    contentType,
  } = data;

  const selectedNodeId = useMindmapStore((s) => s.selectedNodeId);
  const editingNodeId = useMindmapStore((s) => s.editingNodeId);
  const setSelectedNodeId = useMindmapStore((s) => s.setSelectedNodeId);
  const setEditingNodeId = useMindmapStore((s) => s.setEditingNodeId);
  const updateNodeLabel = useMindmapStore((s) => s.updateNodeLabel);
  const addChildNode = useMindmapStore((s) => s.addChildNode);
  const toggleCollapse = useMindmapStore((s) => s.toggleCollapse);
  const deleteNode = useMindmapStore((s) => s.deleteNode);

  const isEditing = editingNodeId === id;
  const isSelected = selected || selectedNodeId === id;

  const [editValue, setEditValue] = React.useState(label);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEditValue(label);
  }, [label]);

  React.useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isEditing]);

  const handleCommitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== label) {
      updateNodeLabel(id, trimmed);
    } else {
      setEditValue(label);
    }
    setEditingNodeId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditValue(label);
      setEditingNodeId(null);
    }
    e.stopPropagation();
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    addChildNode(id);
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCollapse(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const hasRichContent = Boolean(content && content.trim());

  // Node styles based on depth & root
  const getNodeStyle = () => {
    if (isRoot) {
      return {
        container:
          "bg-slate-900 text-white shadow-lg border border-slate-700 min-h-[52px]",
        text: "font-bold text-sm tracking-wide text-white",
      };
    }

    if (depth === 1) {
      return {
        container: "bg-white shadow-md border-2 hover:shadow-lg min-h-[44px]",
        text: "font-semibold text-xs text-slate-800",
      };
    }

    return {
      container:
        "bg-white/95 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md min-h-[38px]",
      text: "font-medium text-xs text-slate-700",
    };
  };

  const styles = getNodeStyle();

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditingNodeId(id);
      }}
      className={cn(
        "group relative flex flex-col rounded-xl px-3.5 py-2 transition-all cursor-pointer select-none",
        hasRichContent ?
          "w-[280px] sm:w-[320px] md:w-[360px]"
        : "max-w-[280px]",
        styles.container,
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
      )}
      style={{
        borderColor:
          !isRoot ?
            isSelected ? "#3b82f6"
            : color
          : undefined,
      }}
    >
      {/* Left connection handle (incoming from parent) */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full">
        {/* Node content / label */}
        <div className="flex-1 min-w-0 pr-2">
          {isEditing ?
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleCommitEdit}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full bg-transparent px-1 py-0.5 outline-none rounded text-xs",
                isRoot ?
                  "text-white bg-slate-800"
                : "text-slate-900 bg-slate-100",
              )}
              autoFocus
            />
          : <span className={cn("block truncate", styles.text)} title={label}>
              {label}
            </span>
          }
        </div>

        {/* Collapse/Expand badge or count */}
        {hasChildren && (
          <button
            type="button"
            onClick={handleToggleCollapse}
            title={
              collapsed ?
                `Expand (${childCount} sub-items)`
              : "Collapse sub-items"
            }
            className={cn(
              "flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.5 transition-transform shrink-0",
              collapsed ?
                "text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
            )}
            style={{
              backgroundColor: collapsed ? color : undefined,
            }}
          >
            {collapsed ?
              <span className="flex items-center gap-0.5">
                <ChevronRight className="h-3 w-3" />
                <span>{childCount}</span>
              </span>
            : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Rich Markdown Content Body (Tables, Code, Formulas, Notes) */}
      {hasRichContent && (
        <RichContentRenderer
          content={content!}
          contentType={contentType}
          color={color}
        />
      )}

      {/* Right Action buttons: Quick Add (+) & Quick Delete (trash) on hover */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={handleAddChild}
          title="Add child branch (Tab)"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-110 transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {!isRoot && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete branch (Delete)"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 hover:scale-110 transition-all cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Right connection handle (outgoing to children) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
