import * as React from "react";
import {
  Layers,
  Activity,
  GitBranch,
  StickyNote,
  ChevronLeft,
  GripVertical,
  PanelRightOpen,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { NodeType } from "@/domain/nodes/types";
import { cn } from "@/utils/cn";

interface DraggableComponent {
  type: NodeType;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderColor: string;
}

const COMPONENTS: DraggableComponent[] = [
  {
    type: "STAGE",
    title: "Stage",
    description: "Main journey phase",
    icon: <Layers className="h-4 w-4" />,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    borderColor: "hover:border-blue-400",
  },
  {
    type: "ACTIVITY",
    title: "Activity",
    description: "Process activity",
    icon: <Activity className="h-4 w-4" />,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
    borderColor: "hover:border-indigo-400",
  },
  {
    type: "DECISION",
    title: "Decision",
    description: "Conditional branch",
    icon: <GitBranch className="h-4 w-4" />,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    borderColor: "hover:border-amber-400",
  },
  {
    type: "NOTE",
    title: "Note",
    description: "Annotation",
    icon: <StickyNote className="h-4 w-4" />,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    borderColor: "hover:border-emerald-400",
  },
];

export function ComponentSidebar() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  if (sidebarCollapsed) {
    return (
      <div className="relative flex flex-col items-center py-4 border-r border-slate-200 bg-white z-10 w-12 shrink-0 select-none">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          className="flex items-center gap-1 -rotate-90 origin-center text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap py-2 cursor-pointer"
          title="Expand Components Sidebar"
          aria-label="Expand Components Sidebar"
        >
          <PanelRightOpen className="h-4 w-4 rotate-90" />
        </button>
      </div>
    );
  }

  return (
    <aside className="relative flex w-64 flex-col border-r border-slate-200 bg-white shrink-0 select-none z-10">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Components
        </span>
        <button
          type="button"
          onClick={() => setSidebarCollapsed(true)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Component Cards */}
      <div className="flex-1 space-y-2.5 p-3 overflow-y-auto">
        <p className="text-[11px] text-slate-500 mb-2 px-1">
          Drag components directly onto the canvas to construct your journey.
        </p>

        {COMPONENTS.map((comp) => (
          <div
            key={comp.type}
            draggable
            onDragStart={(e) => onDragStart(e, comp.type)}
            className={cn(
              "group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs transition-all cursor-grab active:cursor-grabbing hover:shadow-xs",
              comp.borderColor,
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                comp.iconBg,
                comp.iconColor,
              )}
            >
              {comp.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {comp.title}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {comp.description}
              </div>
            </div>

            <GripVertical className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 shrink-0" />
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3 text-[10px] text-slate-400 text-center leading-normal">
        Tip: Drop Activities directly into Stages to nest them.
      </div>
    </aside>
  );
}
