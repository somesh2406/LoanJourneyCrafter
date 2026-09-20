import { create } from "zustand";
import {
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import {
  Mindmap,
  MindmapNodeItem,
  mindmapToMarkdown,
  markdownToMindmap,
} from "@/domain/mindmap/types";
import { getMindmapRepository } from "@/services/mindmap/repository-factory";
import {
  computeMindmapLayout,
  MindmapFlowNode,
  MindmapFlowEdge,
} from "@/features/mindmap/utils/tree-layout";
import { generateId } from "@/utils/ids";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface MindmapState {
  mindmapId: string;
  title: string;
  description: string;
  rootId: string;
  nodes: MindmapNodeItem[];
  isPinned: boolean;

  flowNodes: MindmapFlowNode[];
  flowEdges: MindmapFlowEdge[];

  selectedNodeId: string | null;
  editingNodeId: string | null;

  saveStatus: SaveStatus;
  lastSavedAt: string | null;

  past: MindmapNodeItem[][];
  future: MindmapNodeItem[][];
  canUndo: boolean;
  canRedo: boolean;

  // Lifecycle
  loadMindmap: (id: string) => Promise<void>;
  saveNow: () => Promise<void>;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;

  // Selection & Editing
  setSelectedNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;

  // Node Actions
  addChildNode: (parentId: string, initialLabel?: string) => string;
  addSiblingNode: (targetNodeId: string, initialLabel?: string) => string;
  updateNodeLabel: (id: string, label: string) => void;
  deleteNode: (id: string) => void;
  toggleCollapse: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // Layout & Flow
  onNodesChange: (changes: NodeChange<MindmapFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<MindmapFlowEdge>[]) => void;
  recomputeLayout: () => void;

  // Markdown Import/Export
  exportMarkdown: () => string;
  importMarkdown: (markdown: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const useMindmapStore = create<MindmapState>((set, get) => {
  const scheduleAutosave = () => {
    set({ saveStatus: "unsaved" });
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await get().saveNow();
    }, 600);
  };

  const pushHistory = (currentNodes: MindmapNodeItem[]) => {
    const { past } = get();
    set({
      past: [...past.slice(-20), JSON.parse(JSON.stringify(currentNodes))],
      future: [],
      canUndo: true,
      canRedo: false,
    });
  };

  return {
    mindmapId: "",
    title: "Untitled MindMap",
    description: "",
    rootId: "",
    nodes: [],
    isPinned: false,

    flowNodes: [],
    flowEdges: [],

    selectedNodeId: null,
    editingNodeId: null,

    saveStatus: "saved",
    lastSavedAt: null,

    past: [],
    future: [],
    canUndo: false,
    canRedo: false,

    loadMindmap: async (id: string) => {
      try {
        const repo = getMindmapRepository();
        const mindmap = await repo.get(id);
        if (!mindmap) {
          throw new Error(`Mindmap not found: ${id}`);
        }

        const { flowNodes, flowEdges } = computeMindmapLayout(mindmap.nodes);

        set({
          mindmapId: mindmap.id,
          title: mindmap.title,
          description: mindmap.description,
          rootId: mindmap.rootId,
          nodes: mindmap.nodes,
          isPinned: !!mindmap.isPinned,
          flowNodes,
          flowEdges,
          selectedNodeId: mindmap.rootId,
          editingNodeId: null,
          saveStatus: "saved",
          lastSavedAt: mindmap.updatedAt,
          past: [],
          future: [],
          canUndo: false,
          canRedo: false,
        });
      } catch (err) {
        console.error("Failed to load mindmap:", err);
        set({ saveStatus: "error" });
      }
    },

    saveNow: async () => {
      const state = get();
      if (!state.mindmapId) return;

      try {
        set({ saveStatus: "saving" });
        const repo = getMindmapRepository();
        await repo.update(state.mindmapId, {
          title: state.title,
          description: state.description,
          nodes: state.nodes,
          isPinned: state.isPinned,
        });

        set({
          saveStatus: "saved",
          lastSavedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to save mindmap:", err);
        set({ saveStatus: "error" });
      }
    },

    setTitle: (title: string) => {
      const { nodes, rootId } = get();
      const updatedNodes = nodes.map((n) =>
        n.id === rootId ? { ...n, label: title } : n,
      );
      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);

      set({
        title,
        nodes: updatedNodes,
        flowNodes,
        flowEdges,
      });
      scheduleAutosave();
    },

    setDescription: (description: string) => {
      set({ description });
      scheduleAutosave();
    },

    setSelectedNodeId: (id: string | null) => {
      set({ selectedNodeId: id });
    },

    setEditingNodeId: (id: string | null) => {
      set({ editingNodeId: id });
    },

    addChildNode: (parentId: string, initialLabel = "New Branch") => {
      const { nodes } = get();
      pushHistory(nodes);

      const parent = nodes.find((n) => n.id === parentId);
      if (!parent) return "";

      const newId = `node-${generateId()}`;
      const depth = parent.depth + 1;
      const order = nodes.filter((n) => n.parentId === parentId).length;

      // Ensure parent is uncollapsed
      const updatedNodes = nodes.map((n) =>
        n.id === parentId ? { ...n, collapsed: false } : n,
      );

      const newNode: MindmapNodeItem = {
        id: newId,
        label: initialLabel,
        parentId,
        depth,
        order,
        collapsed: false,
      };

      updatedNodes.push(newNode);
      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);

      set({
        nodes: updatedNodes,
        flowNodes,
        flowEdges,
        selectedNodeId: newId,
        editingNodeId: newId,
      });

      scheduleAutosave();
      return newId;
    },

    addSiblingNode: (targetNodeId: string, initialLabel = "New Topic") => {
      const { nodes, rootId } = get();
      const target = nodes.find((n) => n.id === targetNodeId);
      if (!target || target.id === rootId || !target.parentId) {
        // If target is root, add child instead
        return get().addChildNode(rootId, initialLabel);
      }

      pushHistory(nodes);

      const newId = `node-${generateId()}`;
      const siblings = nodes.filter((n) => n.parentId === target.parentId);
      const targetIndex = siblings.findIndex((n) => n.id === targetNodeId);

      const newNode: MindmapNodeItem = {
        id: newId,
        label: initialLabel,
        parentId: target.parentId,
        depth: target.depth,
        order: targetIndex >= 0 ? targetIndex + 1 : siblings.length,
        collapsed: false,
      };

      // Re-index siblings after target
      const updatedNodes = nodes.map((n) => {
        if (n.parentId === target.parentId && n.order > targetIndex) {
          return { ...n, order: n.order + 1 };
        }
        return n;
      });

      updatedNodes.push(newNode);
      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);

      set({
        nodes: updatedNodes,
        flowNodes,
        flowEdges,
        selectedNodeId: newId,
        editingNodeId: newId,
      });

      scheduleAutosave();
      return newId;
    },

    updateNodeLabel: (id: string, label: string) => {
      const { nodes, rootId, title } = get();
      const target = nodes.find((n) => n.id === id);
      if (!target || target.label === label) return;

      const updatedNodes = nodes.map((n) =>
        n.id === id ? { ...n, label } : n,
      );

      const newTitle = id === rootId ? label : title;
      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);

      set({
        title: newTitle,
        nodes: updatedNodes,
        flowNodes,
        flowEdges,
      });

      scheduleAutosave();
    },

    deleteNode: (id: string) => {
      const { nodes, rootId } = get();
      if (id === rootId) return; // Cannot delete root

      const target = nodes.find((n) => n.id === id);
      if (!target) return;

      pushHistory(nodes);

      // Collect all descendant ids recursively
      const idsToDelete = new Set<string>([id]);
      let added = true;
      while (added) {
        added = false;
        for (const n of nodes) {
          if (
            n.parentId &&
            idsToDelete.has(n.parentId) &&
            !idsToDelete.has(n.id)
          ) {
            idsToDelete.add(n.id);
            added = true;
          }
        }
      }

      const updatedNodes = nodes.filter((n) => !idsToDelete.has(n.id));
      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);

      set({
        nodes: updatedNodes,
        flowNodes,
        flowEdges,
        selectedNodeId: target.parentId || rootId,
        editingNodeId: null,
      });

      scheduleAutosave();
    },

    toggleCollapse: (id: string) => {
      const { nodes } = get();
      const target = nodes.find((n) => n.id === id);
      if (!target) return;

      const updatedNodes = nodes.map((n) =>
        n.id === id ? { ...n, collapsed: !n.collapsed } : n,
      );

      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);

      set({
        nodes: updatedNodes,
        flowNodes,
        flowEdges,
      });

      scheduleAutosave();
    },

    expandAll: () => {
      const { nodes } = get();
      const updatedNodes = nodes.map((n) => ({ ...n, collapsed: false }));
      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);
      set({ nodes: updatedNodes, flowNodes, flowEdges });
      scheduleAutosave();
    },

    collapseAll: () => {
      const { nodes, rootId } = get();
      // Collapse everything except root
      const updatedNodes = nodes.map((n) =>
        n.id === rootId ? n : { ...n, collapsed: true },
      );
      const { flowNodes, flowEdges } = computeMindmapLayout(updatedNodes);
      set({ nodes: updatedNodes, flowNodes, flowEdges });
      scheduleAutosave();
    },

    onNodesChange: (changes: NodeChange<MindmapFlowNode>[]) => {
      const { flowNodes } = get();
      set({
        flowNodes: applyNodeChanges(changes, flowNodes),
      });
    },

    onEdgesChange: (changes: EdgeChange<MindmapFlowEdge>[]) => {
      const { flowEdges } = get();
      set({
        flowEdges: applyEdgeChanges(changes, flowEdges),
      });
    },

    recomputeLayout: () => {
      const { nodes } = get();
      const { flowNodes, flowEdges } = computeMindmapLayout(nodes);
      set({ flowNodes, flowEdges });
    },

    exportMarkdown: () => {
      const { mindmapId, title, description, rootId, nodes, isPinned } = get();
      const mindmap: Mindmap = {
        id: mindmapId,
        title,
        description,
        rootId,
        nodes,
        createdAt: "",
        updatedAt: "",
        isPinned,
      };
      return mindmapToMarkdown(mindmap);
    },

    importMarkdown: (markdown: string) => {
      const { mindmapId } = get();
      const parsed = markdownToMindmap(markdown, mindmapId);
      pushHistory(get().nodes);

      const { flowNodes, flowEdges } = computeMindmapLayout(parsed.nodes);

      set({
        title: parsed.title,
        description: parsed.description,
        rootId: parsed.rootId,
        nodes: parsed.nodes,
        flowNodes,
        flowEdges,
        selectedNodeId: parsed.rootId,
        editingNodeId: null,
      });

      scheduleAutosave();
    },

    undo: () => {
      const { past, nodes, future } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);

      const { flowNodes, flowEdges } = computeMindmapLayout(previous);

      set({
        past: newPast,
        future: [JSON.parse(JSON.stringify(nodes)), ...future],
        nodes: previous,
        flowNodes,
        flowEdges,
        canUndo: newPast.length > 0,
        canRedo: true,
      });

      scheduleAutosave();
    },

    redo: () => {
      const { past, nodes, future } = get();
      if (future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);

      const { flowNodes, flowEdges } = computeMindmapLayout(next);

      set({
        past: [...past, JSON.parse(JSON.stringify(nodes))],
        future: newFuture,
        nodes: next,
        flowNodes,
        flowEdges,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });

      scheduleAutosave();
    },
  };
});
