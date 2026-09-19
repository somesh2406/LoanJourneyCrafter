import { create } from 'zustand';
import {
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as addFlowEdge,
  MarkerType,
} from '@xyflow/react';
import {
  EditorNode,
  EditorEdge,
  EditorNodeData,
  journeyToEditorState,
  editorStateToJourney,
} from '@/domain/journey/mapper';
import { Journey, JourneyStatus } from '@/domain/journey/types';
import { Condition } from '@/domain/nodes/types';
import { getJourneyRepository } from '@/services/journey/repository-factory';
import { calculateStageChildrenBounds } from '@/utils/geometry';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface HistorySnapshot {
  nodes: EditorNode[];
  edges: EditorEdge[];
  title: string;
  description: string;
  status: JourneyStatus;
}

interface JourneyState {
  journeyId: string;
  title: string;
  description: string;
  status: JourneyStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  metadata: Record<string, unknown>;
  isPinned: boolean;

  nodes: EditorNode[];
  edges: EditorEdge[];

  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  saveStatus: SaveStatus;
  lastSavedAt: string | null;

  past: HistorySnapshot[];
  future: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;

  // Lifecycle
  initJourney: (journey: Journey) => void;

  // React Flow handlers (ephemeral updates during live movement/selection)
  onNodesChange: (changes: NodeChange<EditorNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<EditorEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // Selection
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;

  // History transactions (discrete user operations)
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Mutations
  updateTitle: (newTitle: string) => void;
  updateDescription: (newDesc: string) => void;
  updateStatus: (newStatus: JourneyStatus) => void;
  addNode: (node: EditorNode) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  updateNodeData: (nodeId: string, patch: Partial<EditorNodeData>) => void;
  commitNodeDrag: (nodeId: string, position: { x: number; y: number }, parentId?: string | null) => void;
  commitNodeResize: (
    nodeId: string,
    size: { width: number; height: number },
    position?: { x: number; y: number }
  ) => void;
  toggleStageCollapse: (stageId: string) => void;
  expandAllStages: () => void;
  collapseAllStages: () => void;
  reparentActivity: (
    activityId: string,
    targetStageId: string | null,
    newPosition: { x: number; y: number }
  ) => void;
  addCondition: (decisionId: string, condition: Condition) => void;
  updateCondition: (decisionId: string, conditionId: string, patch: Partial<Condition>) => void;
  removeCondition: (decisionId: string, conditionId: string) => void;

  // Persistence
  saveJourney: (explicit?: boolean) => Promise<void>;
  markUnsaved: () => void;
}

const MAX_HISTORY = 40;
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

export const useJourneyStore = create<JourneyState>((set, get) => {
  const triggerAutosave = () => {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    set({ saveStatus: 'unsaved' });
    autosaveTimer = setTimeout(() => {
      get().saveJourney(false);
    }, 800);
  };

  const createSnapshot = (): HistorySnapshot => {
    const s = get();
    return {
      nodes: JSON.parse(JSON.stringify(s.nodes)),
      edges: JSON.parse(JSON.stringify(s.edges)),
      title: s.title,
      description: s.description,
      status: s.status,
    };
  };

  return {
    journeyId: '',
    title: 'Untitled Journey',
    description: '',
    status: 'draft',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'User',
    updatedBy: 'User',
    metadata: {},
    isPinned: false,

    nodes: [],
    edges: [],

    selectedNodeId: null,
    selectedEdgeId: null,

    saveStatus: 'saved',
    lastSavedAt: null,

    past: [],
    future: [],
    canUndo: false,
    canRedo: false,

    initJourney: (journey: Journey) => {
      if (autosaveTimer) clearTimeout(autosaveTimer);
      const { nodes, edges } = journeyToEditorState(journey);
      set({
        journeyId: journey.id,
        title: journey.title,
        description: journey.description,
        status: journey.status,
        version: journey.version,
        createdAt: journey.createdAt,
        updatedAt: journey.updatedAt,
        createdBy: journey.createdBy,
        updatedBy: journey.updatedBy,
        metadata: journey.metadata || {},
        isPinned: !!journey.isPinned,
        nodes,
        edges,
        selectedNodeId: null,
        selectedEdgeId: null,
        saveStatus: 'saved',
        lastSavedAt: journey.updatedAt,
        past: [],
        future: [],
        canUndo: false,
        canRedo: false,
      });
    },

    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    onConnect: (connection) => {
      if (!connection.source || !connection.target || connection.source === connection.target) {
        return;
      }
      get().pushSnapshot();

      const conditionId = connection.sourceHandle?.startsWith('condition-')
        ? connection.sourceHandle.replace('condition-', '')
        : null;

      const newEdge: EditorEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'journeyEdge',
        data: {
          conditionId,
          label: null,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: '#64748b',
        },
      };

      set({
        edges: addFlowEdge(newEdge, get().edges),
      });
      triggerAutosave();
    },

    selectNode: (id) => {
      set({ selectedNodeId: id, selectedEdgeId: null });
    },

    selectEdge: (id) => {
      set({ selectedEdgeId: id, selectedNodeId: null });
    },

    pushSnapshot: () => {
      const snap = createSnapshot();
      const past = [...get().past, snap].slice(-MAX_HISTORY);
      set({
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      });
    },

    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const currentSnap = createSnapshot();

      set({
        nodes: previous.nodes,
        edges: previous.edges,
        title: previous.title,
        description: previous.description,
        status: previous.status,
        past: newPast,
        future: [currentSnap, ...future],
        canUndo: newPast.length > 0,
        canRedo: true,
      });
      triggerAutosave();
    },

    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);
      const currentSnap = createSnapshot();

      set({
        nodes: next.nodes,
        edges: next.edges,
        title: next.title,
        description: next.description,
        status: next.status,
        past: [...past, currentSnap],
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
      triggerAutosave();
    },

    updateTitle: (newTitle) => {
      if (newTitle === get().title) return;
      get().pushSnapshot();
      set({ title: newTitle });
      triggerAutosave();
    },

    updateDescription: (newDesc) => {
      if (newDesc === get().description) return;
      get().pushSnapshot();
      set({ description: newDesc });
      triggerAutosave();
    },

    updateStatus: (newStatus) => {
      if (newStatus === get().status) return;
      get().pushSnapshot();
      set({ status: newStatus });
      triggerAutosave();
    },

    addNode: (node) => {
      get().pushSnapshot();
      set({
        nodes: [...get().nodes, node],
        selectedNodeId: node.id,
      });
      triggerAutosave();
    },

    deleteNode: (nodeId) => {
      const state = get();
      get().pushSnapshot();

      // If this is a stage, also delete its child activities!
      const childActivityIds = new Set(
        state.nodes.filter((n) => n.parentId === nodeId).map((n) => n.id)
      );
      const allDeletedNodeIds = new Set([nodeId, ...childActivityIds]);

      // Remove nodes
      const nextNodes = state.nodes.filter((n) => !allDeletedNodeIds.has(n.id));

      // Remove all connected edges
      const nextEdges = state.edges.filter(
        (e) => !allDeletedNodeIds.has(e.source) && !allDeletedNodeIds.has(e.target)
      );

      set({
        nodes: nextNodes,
        edges: nextEdges,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      });
      triggerAutosave();
    },

    deleteEdge: (edgeId) => {
      get().pushSnapshot();
      set({
        edges: get().edges.filter((e) => e.id !== edgeId),
        selectedEdgeId: get().selectedEdgeId === edgeId ? null : get().selectedEdgeId,
      });
      triggerAutosave();
    },

    updateNodeData: (nodeId, patch) => {
      get().pushSnapshot();
      set({
        nodes: get().nodes.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...patch,
              },
            };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    commitNodeDrag: (nodeId, position, parentId) => {
      const current = get().nodes.find((n) => n.id === nodeId);
      if (!current) return;

      // Only push snapshot if position actually changed
      if (
        current.position.x === position.x &&
        current.position.y === position.y &&
        (current.parentId || null) === (parentId || null)
      ) {
        return;
      }

      get().pushSnapshot();
      set({
        nodes: get().nodes.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              position: { ...position },
              parentId: parentId !== undefined ? (parentId || undefined) : n.parentId,
            };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    commitNodeResize: (nodeId, size, position) => {
      const current = get().nodes.find((n) => n.id === nodeId);
      if (!current) return;

      get().pushSnapshot();
      set({
        nodes: get().nodes.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              width: size.width,
              height: size.height,
              style: {
                ...n.style,
                width: size.width,
                height: size.height,
              },
              position: position ? { ...position } : n.position,
            };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    toggleStageCollapse: (stageId) => {
      const stage = get().nodes.find((n) => n.id === stageId);
      if (!stage) return;

      get().pushSnapshot();
      const nextCollapsed = !(stage.data as { isCollapsed?: boolean }).isCollapsed;

      set({
        nodes: get().nodes.map((n) => {
          if (n.id === stageId) {
            return {
              ...n,
              data: {
                ...n.data,
                isCollapsed: nextCollapsed,
              },
            };
          }
          if (n.parentId === stageId) {
            return {
              ...n,
              hidden: nextCollapsed,
            };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    expandAllStages: () => {
      get().pushSnapshot();
      set({
        nodes: get().nodes.map((n) => {
          if (n.type === 'stageNode') {
            return {
              ...n,
              data: { ...n.data, isCollapsed: false },
            };
          }
          if (n.parentId) {
            return { ...n, hidden: false };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    collapseAllStages: () => {
      get().pushSnapshot();
      set({
        nodes: get().nodes.map((n) => {
          if (n.type === 'stageNode') {
            return {
              ...n,
              data: { ...n.data, isCollapsed: true },
            };
          }
          if (n.parentId) {
            return { ...n, hidden: true };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    reparentActivity: (activityId, targetStageId, newPosition) => {
      const state = get();
      const activity = state.nodes.find((n) => n.id === activityId);
      if (!activity) return;

      get().pushSnapshot();

      let targetStage = targetStageId ? state.nodes.find((n) => n.id === targetStageId) : null;

      // If targetStage exists, ensure its dimensions contain the new child
      let updatedTargetStageWidth = targetStage?.width;
      let updatedTargetStageHeight = targetStage?.height;

      if (targetStage) {
        const existingChildren = state.nodes.filter(
          (n) => n.parentId === targetStageId && n.id !== activityId
        );
        const childW = activity.width || 220;
        const childH = activity.height || 76;
        const bounds = calculateStageChildrenBounds([
          ...existingChildren,
          { position: newPosition, width: childW, height: childH },
        ]);

        if ((targetStage.width || 320) < bounds.minWidth) {
          updatedTargetStageWidth = bounds.minWidth;
        }
        if ((targetStage.height || 280) < bounds.minHeight) {
          updatedTargetStageHeight = bounds.minHeight;
        }
      }

      set({
        nodes: state.nodes.map((n) => {
          if (n.id === activityId) {
            return {
              ...n,
              parentId: targetStageId || undefined,
              position: { ...newPosition },
              hidden: targetStage ? !!(targetStage.data as { isCollapsed?: boolean }).isCollapsed : false,
            };
          }
          if (targetStageId && n.id === targetStageId && (updatedTargetStageWidth || updatedTargetStageHeight)) {
            return {
              ...n,
              width: updatedTargetStageWidth ?? n.width,
              height: updatedTargetStageHeight ?? n.height,
              style: {
                ...n.style,
                width: updatedTargetStageWidth ?? n.width,
                height: updatedTargetStageHeight ?? n.height,
              },
            };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    addCondition: (decisionId, condition) => {
      const decision = get().nodes.find((n) => n.id === decisionId);
      if (!decision) return;

      get().pushSnapshot();
      const existingConditions = ((decision.data.conditions as Condition[]) || []);

      set({
        nodes: get().nodes.map((n) => {
          if (n.id === decisionId) {
            return {
              ...n,
              data: {
                ...n.data,
                conditions: [...existingConditions, condition],
              },
            };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    updateCondition: (decisionId, conditionId, patch) => {
      const decision = get().nodes.find((n) => n.id === decisionId);
      if (!decision) return;

      get().pushSnapshot();
      const conditions = ((decision.data.conditions as Condition[]) || []).map((c) =>
        c.id === conditionId ? { ...c, ...patch } : c
      );

      set({
        nodes: get().nodes.map((n) => {
          if (n.id === decisionId) {
            return {
              ...n,
              data: { ...n.data, conditions },
            };
          }
          return n;
        }),
      });
      triggerAutosave();
    },

    removeCondition: (decisionId, conditionId) => {
      const decision = get().nodes.find((n) => n.id === decisionId);
      if (!decision) return;

      get().pushSnapshot();
      const conditions = ((decision.data.conditions as Condition[]) || []).filter(
        (c) => c.id !== conditionId
      );

      // Also remove any edges originating from this condition handle!
      const conditionHandleId = `condition-${conditionId}`;
      const edges = get().edges.filter(
        (e) => !(e.source === decisionId && (e.sourceHandle === conditionHandleId || e.data?.conditionId === conditionId))
      );

      set({
        nodes: get().nodes.map((n) => {
          if (n.id === decisionId) {
            return {
              ...n,
              data: { ...n.data, conditions },
            };
          }
          return n;
        }),
        edges,
      });
      triggerAutosave();
    },

    saveJourney: async (_explicit = false) => {
      const s = get();
      if (!s.journeyId) return;

      try {
        set({ saveStatus: 'saving' });
        const repo = getJourneyRepository();
        const existing = await repo.get(s.journeyId);
        if (!existing) {
          throw new Error('Journey not found in repository');
        }

        const domainJourney = editorStateToJourney(s.nodes, s.edges, {
          id: s.journeyId,
          title: s.title,
          description: s.description,
          version: s.version,
          status: s.status,
          createdAt: s.createdAt,
          updatedAt: new Date().toISOString(),
          createdBy: s.createdBy,
          updatedBy: s.updatedBy,
          metadata: s.metadata,
          isPinned: s.isPinned,
        });

        await repo.update(s.journeyId, {
          title: domainJourney.title,
          description: domainJourney.description,
          status: domainJourney.status,
          version: domainJourney.version,
          nodes: domainJourney.nodes,
          edges: domainJourney.edges,
          metadata: domainJourney.metadata,
          isPinned: domainJourney.isPinned,
        });

        const now = new Date().toISOString();
        set({
          saveStatus: 'saved',
          lastSavedAt: now,
          updatedAt: now,
        });
      } catch (err) {
        console.error('Failed to save journey:', err);
        set({ saveStatus: 'error' });
      }
    },

    markUnsaved: () => {
      triggerAutosave();
    },
  };
});
