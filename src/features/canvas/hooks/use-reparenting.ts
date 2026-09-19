import * as React from 'react';
import { type OnNodeDrag } from '@xyflow/react';
import { useJourneyStore } from '@/stores/journey-store';
import { EditorNode } from '@/domain/journey/mapper';

export function useReparenting() {
  const nodes = useJourneyStore((s) => s.nodes);
  const reparentActivity = useJourneyStore((s) => s.reparentActivity);
  const commitNodeDrag = useJourneyStore((s) => s.commitNodeDrag);

  const handleNodeDragStop: OnNodeDrag<EditorNode> = React.useCallback(
    (_event, node) => {
      const editorNode = node;

      if (editorNode.type === 'activityNode') {
        const childW = editorNode.width ?? 220;
        const childH = editorNode.height ?? 76;

        // Stage nodes on the canvas
        const stageNodes = nodes.filter((n) => n.type === 'stageNode');

        // Case A: Node is currently inside a stage
        if (editorNode.parentId) {
          const currentStage = stageNodes.find((s) => s.id === editorNode.parentId);
          if (currentStage) {
            const stageW = currentStage.width ?? 340;
            const stageH = currentStage.height ?? 280;

            const childCenterX = editorNode.position.x + childW / 2;
            const childCenterY = editorNode.position.y + childH / 2;

            // Check if dragged outside current stage bounds
            const isOutside =
              childCenterX < 0 ||
              childCenterX > stageW ||
              childCenterY < 0 ||
              childCenterY > stageH;

            if (isOutside) {
              // Convert to absolute canvas coordinates
              const absX = Math.round(currentStage.position.x + editorNode.position.x);
              const absY = Math.round(currentStage.position.y + editorNode.position.y);
              const absCenterX = absX + childW / 2;
              const absCenterY = absY + childH / 2;

              // Check if dropped into another stage
              const otherStage = stageNodes.find(
                (s) =>
                  s.id !== currentStage.id &&
                  absCenterX >= s.position.x &&
                  absCenterX <= s.position.x + (s.width ?? 340) &&
                  absCenterY >= s.position.y &&
                  absCenterY <= s.position.y + (s.height ?? 280)
              );

              if (otherStage) {
                // Drop into new stage
                const relX = Math.round(absX - otherStage.position.x);
                const relY = Math.round(absY - otherStage.position.y);
                const clampedX = Math.max(16, Math.min(relX, (otherStage.width ?? 340) - childW - 16));
                const clampedY = Math.max(56, Math.min(relY, (otherStage.height ?? 280) - childH - 16));
                reparentActivity(editorNode.id, otherStage.id, { x: clampedX, y: clampedY });
              } else {
                // Drop onto root canvas as independent activity
                reparentActivity(editorNode.id, null, { x: absX, y: absY });
              }
              return;
            } else {
              // Stayed inside current stage - just commit position
              commitNodeDrag(
                editorNode.id,
                { x: Math.round(editorNode.position.x), y: Math.round(editorNode.position.y) },
                currentStage.id
              );
              return;
            }
          }
        }

        // Case B: Independent activity (no parentId)
        const absCenterX = editorNode.position.x + childW / 2;
        const absCenterY = editorNode.position.y + childH / 2;

        const targetStage = stageNodes.find(
          (s) =>
            absCenterX >= s.position.x &&
            absCenterX <= s.position.x + (s.width ?? 340) &&
            absCenterY >= s.position.y &&
            absCenterY <= s.position.y + (s.height ?? 280)
        );

        if (targetStage) {
          // Dragged inside a stage: convert absolute coordinates into stage-relative
          const relX = Math.round(editorNode.position.x - targetStage.position.x);
          const relY = Math.round(editorNode.position.y - targetStage.position.y);
          const clampedX = Math.max(16, Math.min(relX, (targetStage.width ?? 340) - childW - 16));
          const clampedY = Math.max(56, Math.min(relY, (targetStage.height ?? 280) - childH - 16));

          reparentActivity(editorNode.id, targetStage.id, { x: clampedX, y: clampedY });
        } else {
          // Commit independent position on canvas
          commitNodeDrag(editorNode.id, {
            x: Math.round(editorNode.position.x),
            y: Math.round(editorNode.position.y),
          });
        }
        return;
      }

      // Other node types (STAGE, DECISION, NOTE)
      commitNodeDrag(editorNode.id, {
        x: Math.round(editorNode.position.x),
        y: Math.round(editorNode.position.y),
      });
    },
    [nodes, reparentActivity, commitNodeDrag]
  );

  return { handleNodeDragStop };
}
