import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { Focus, RefreshCw } from "lucide-react";
import { useMindmapStore } from "@/stores/mindmap-store";
import { MindmapNode } from "./mindmap-node";
import { MindmapEdge } from "./mindmap-edge";
import { MindmapNavbar } from "./mindmap-navbar";
import { Button } from "@/components/ui/button";

const nodeTypes: NodeTypes = {
  mindmapNode: MindmapNode,
};

const edgeTypes: EdgeTypes = {
  mindmapEdge: MindmapEdge,
};

export function MindmapLayout() {
  const { fitView } = useReactFlow();

  const flowNodes = useMindmapStore((s) => s.flowNodes);
  const flowEdges = useMindmapStore((s) => s.flowEdges);
  const onNodesChange = useMindmapStore((s) => s.onNodesChange);
  const onEdgesChange = useMindmapStore((s) => s.onEdgesChange);
  const selectedNodeId = useMindmapStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useMindmapStore((s) => s.setSelectedNodeId);
  const setEditingNodeId = useMindmapStore((s) => s.setEditingNodeId);
  const addChildNode = useMindmapStore((s) => s.addChildNode);
  const addSiblingNode = useMindmapStore((s) => s.addSiblingNode);
  const deleteNode = useMindmapStore((s) => s.deleteNode);
  const rootId = useMindmapStore((s) => s.rootId);
  const recomputeLayout = useMindmapStore((s) => s.recomputeLayout);
  const undo = useMindmapStore((s) => s.undo);
  const redo = useMindmapStore((s) => s.redo);

  const initialFitViewDone = React.useRef(false);

  // Initial fit view once nodes are loaded
  React.useEffect(() => {
    if (!initialFitViewDone.current && flowNodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
        initialFitViewDone.current = true;
      }, 100);
    }
  }, [flowNodes.length, fitView]);

  // Global Keyboard Shortcuts for MindMap Studio
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in input / textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isInput) return;

      const activeId = selectedNodeId || rootId;

      // Tab: Add Child
      if (e.key === "Tab") {
        e.preventDefault();
        if (activeId) {
          addChildNode(activeId);
        }
      }

      // Enter: Add Sibling
      else if (e.key === "Enter") {
        e.preventDefault();
        if (activeId) {
          addSiblingNode(activeId);
        }
      }

      // Space: Edit Node
      else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (activeId) {
          setEditingNodeId(activeId);
        }
      }

      // Delete / Backspace: Delete Node
      else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId && selectedNodeId !== rootId) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        }
      }

      // Escape: Deselect / Blur
      else if (e.key === "Escape") {
        e.preventDefault();
        setSelectedNodeId(null);
        setEditingNodeId(null);
      }

      // Undo / Redo
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNodeId,
    rootId,
    addChildNode,
    addSiblingNode,
    setEditingNodeId,
    deleteNode,
    setSelectedNodeId,
    undo,
    redo,
  ]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
      <MindmapNavbar />

      <main className="relative flex-1 w-full h-full">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => {
            setSelectedNodeId(null);
            setEditingNodeId(null);
          }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          minZoom={0.15}
          maxZoom={2.5}
          fitView
          fitViewOptions={{ padding: 0.25 }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.2}
            color="#cbd5e1"
          />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>

        {/* Bottom Floating Helper Bar */}
        <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fitView({ padding: 0.25, duration: 300 })}
            className="h-7 px-2 text-xs flex items-center gap-1.5 text-slate-700 hover:text-slate-900 cursor-pointer"
            title="Fit to Center"
          >
            <Focus className="h-3.5 w-3.5" />
            <span>Fit View</span>
          </Button>

          <div className="h-3.5 w-[1px] bg-slate-200" />

          <Button
            variant="ghost"
            size="sm"
            onClick={recomputeLayout}
            className="h-7 px-2 text-xs flex items-center gap-1.5 text-slate-700 hover:text-slate-900 cursor-pointer"
            title="Auto-align Branches"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Auto Layout</span>
          </Button>

          <div className="h-3.5 w-[1px] bg-slate-200" />

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 pl-1">
            <span>
              Press{" "}
              <kbd className="rounded bg-slate-100 px-1 font-mono text-slate-600">
                Tab
              </kbd>{" "}
              for child,{" "}
              <kbd className="rounded bg-slate-100 px-1 font-mono text-slate-600">
                Enter
              </kbd>{" "}
              for sibling
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
