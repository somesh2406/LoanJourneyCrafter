import { create } from 'zustand';

export interface DeleteConfirmData {
  nodeId?: string;
  edgeId?: string;
  title: string;
  description: string;
  isStageWithChildren?: boolean;
  childCount?: number;
  connectionCount?: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  overviewOpen: boolean;
  setOverviewOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  glanceOpen: boolean;
  setGlanceOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean | ((prev: boolean) => boolean)) => void;

  validationModalOpen: boolean;
  setValidationModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  deleteConfirm: DeleteConfirmData | null;
  setDeleteConfirm: (data: DeleteConfirmData | null) => void;

  highlightedNodeId: string | null;
  setHighlightedNodeId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set((s) => ({ sidebarCollapsed: typeof v === 'function' ? v(s.sidebarCollapsed) : v })),

  inspectorOpen: true,
  setInspectorOpen: (v) => set((s) => ({ inspectorOpen: typeof v === 'function' ? v(s.inspectorOpen) : v })),

  overviewOpen: false,
  setOverviewOpen: (v) => set((s) => ({ overviewOpen: typeof v === 'function' ? v(s.overviewOpen) : v })),

  glanceOpen: true,
  setGlanceOpen: (v) => set((s) => ({ glanceOpen: typeof v === 'function' ? v(s.glanceOpen) : v })),

  fullscreen: false,
  setFullscreen: (v) => set((s) => ({ fullscreen: typeof v === 'function' ? v(s.fullscreen) : v })),

  validationModalOpen: false,
  setValidationModalOpen: (v) => set((s) => ({ validationModalOpen: typeof v === 'function' ? v(s.validationModalOpen) : v })),

  deleteConfirm: null,
  setDeleteConfirm: (data) => set({ deleteConfirm: data }),

  highlightedNodeId: null,
  setHighlightedNodeId: (id) => set({ highlightedNodeId: id }),
}));
