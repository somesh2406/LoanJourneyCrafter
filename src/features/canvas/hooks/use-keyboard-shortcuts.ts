import * as React from 'react';
import { useJourneyStore } from '@/stores/journey-store';
import { useUIStore } from '@/stores/ui-store';

export function useKeyboardShortcuts() {
  const selectedNodeId = useJourneyStore((s) => s.selectedNodeId);
  const selectedEdgeId = useJourneyStore((s) => s.selectedEdgeId);
  const nodes = useJourneyStore((s) => s.nodes);
  const edges = useJourneyStore((s) => s.edges);
  const deleteEdge = useJourneyStore((s) => s.deleteEdge);
  const undo = useJourneyStore((s) => s.undo);
  const redo = useJourneyStore((s) => s.redo);
  const saveJourney = useJourneyStore((s) => s.saveJourney);
  const selectNode = useJourneyStore((s) => s.selectNode);
  const selectEdge = useJourneyStore((s) => s.selectEdge);

  const setDeleteConfirm = useUIStore((s) => s.setDeleteConfirm);
  const fullscreen = useUIStore((s) => s.fullscreen);
  const setFullscreen = useUIStore((s) => s.setFullscreen);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form elements
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveJourney(true);
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        if (!isInput) {
          e.preventDefault();
          undo();
          return;
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl + Y: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      ) {
        if (!isInput) {
          e.preventDefault();
          redo();
          return;
        }
      }

      // Escape
      if (e.key === 'Escape') {
        if (fullscreen) {
          setFullscreen(false);
          return;
        }
        selectNode(null);
        selectEdge(null);
        return;
      }

      // If user is typing in an input, skip single-key canvas shortcuts
      if (isInput) return;

      // 'F': Toggle fullscreen
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setFullscreen((prev) => !prev);
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          const targetNode = nodes.find((n) => n.id === selectedNodeId);
          if (!targetNode) return;

          const childCount = nodes.filter((n) => n.parentId === selectedNodeId).length;
          const connCount = edges.filter(
            (ed) => ed.source === selectedNodeId || ed.target === selectedNodeId
          ).length;

          if (childCount > 0 || connCount > 0) {
            setDeleteConfirm({
              nodeId: selectedNodeId,
              title: `Delete ${(targetNode.data.title as string) || targetNode.id}`,
              description:
                childCount > 0
                  ? `This stage contains ${childCount} activities.`
                  : `This component has ${connCount} connections.`,
              isStageWithChildren: childCount > 0,
              childCount,
              connectionCount: connCount,
            });
          } else {
            // Delete directly when no connections or children
            useJourneyStore.getState().deleteNode(selectedNodeId);
          }
          return;
        }

        if (selectedEdgeId) {
          e.preventDefault();
          deleteEdge(selectedEdgeId);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
    undo,
    redo,
    saveJourney,
    selectNode,
    selectEdge,
    deleteEdge,
    setDeleteConfirm,
    fullscreen,
    setFullscreen,
  ]);
}
