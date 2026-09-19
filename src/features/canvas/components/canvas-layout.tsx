import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  SelectionMode,
  BackgroundVariant,
  useReactFlow,
} from "@xyflow/react";
import { Minimize2 } from "lucide-react";
import { useJourneyStore } from "@/stores/journey-store";
import { useUIStore } from "@/stores/ui-store";
import { nodeTypes } from "../nodes";
import { edgeTypes } from "../edges";
import { TopNavbar } from "./top-navbar";
import { ComponentSidebar } from "./component-sidebar";
import { FloatingToolbar } from "./floating-toolbar";
import { GlanceView } from "./glance-view";
import { JourneyOverview } from "./journey-overview";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { InspectorPanel } from "@/features/inspector/components/inspector-panel";
import { ValidationModal } from "@/features/validation/components/validation-modal";
import { useReparenting } from "../hooks/use-reparenting";
import { useCanvasDragDrop } from "../hooks/use-canvas-drag-drop";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { Button } from "@/components/ui/button";

export function CanvasLayout() {
  const { fitView } = useReactFlow();

  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);
  const onNodesChange = useJourneyStore((s) => s.onNodesChange);
  const onEdgesChange = useJourneyStore((s) => s.onEdgesChange);
  const onConnect = useJourneyStore((s) => s.onConnect);
  const selectNode = useJourneyStore((s) => s.selectNode);
  const selectEdge = useJourneyStore((s) => s.selectEdge);

  const fullscreen = useUIStore((s) => s.fullscreen);
  const setFullscreen = useUIStore((s) => s.setFullscreen);

  // Hooks
  const { handleNodeDragStop } = useReparenting();
  const { onDragOver, onDrop } = useCanvasDragDrop();
  useKeyboardShortcuts();

  // Initial fit view
  const hasFitViewRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasFitViewRef.current && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
        hasFitViewRef.current = true;
      }, 100);
    }
  }, [nodes.length, fitView]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100">
      {/* Top Navbar: hidden in fullscreen */}
      {!fullscreen && <TopNavbar />}

      {/* Main Studio Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Component Sidebar: hidden in fullscreen */}
        {!fullscreen && <ComponentSidebar />}

        {/* Center Canvas Area */}
        <main
          className="relative flex-1 h-full w-full overflow-hidden bg-slate-50"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={(_e, node) => selectNode(node.id)}
            onEdgeClick={(_e, edge) => selectEdge(edge.id)}
            onPaneClick={() => {
              selectNode(null);
              selectEdge(null);
            }}
            onNodeDragStop={handleNodeDragStop}
            selectionMode={SelectionMode.Partial}
            deleteKeyCode={null} // Handled cleanly by our custom keyboard shortcuts and confirmation dialog
            minZoom={0.2}
            maxZoom={2.5}
            defaultViewport={{ x: 50, y: 50, zoom: 0.85 }}
            fitViewOptions={{ padding: 0.25 }}
            snapToGrid
            snapGrid={[16, 16]}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.5}
              color="#cbd5e1"
            />
            <Controls showInteractive={false} className="hidden!" />
          </ReactFlow>

          {/* Exit Fullscreen Control when in fullscreen */}
          {fullscreen && (
            <div className="absolute top-4 right-4 z-30">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFullscreen(false)}
                className="gap-1.5 shadow-lg bg-white/95 text-xs text-slate-800 hover:bg-white border border-slate-200 cursor-pointer"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen (Esc)</span>
              </Button>
            </div>
          )}

          {/* Floating UI Overlays */}
          <FloatingToolbar />
          <GlanceView />
          <JourneyOverview />
          <DeleteConfirmDialog />
          <ValidationModal />
        </main>

        {/* Right Inspector Panel: hidden in fullscreen */}
        {!fullscreen && <InspectorPanel />}
      </div>
    </div>
  );
}
