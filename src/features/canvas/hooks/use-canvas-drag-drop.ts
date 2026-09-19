import * as React from 'react';
import { useReactFlow } from '@xyflow/react';
import { useJourneyStore } from '@/stores/journey-store';
import { generateId } from '@/utils/ids';
import { NodeType } from '@/domain/nodes/types';

export function useCanvasDragDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useJourneyStore((s) => s.addNode);
  const nodes = useJourneyStore((s) => s.nodes);

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (type === 'STAGE') {
        const stageCount = nodes.filter((n) => n.type === 'stageNode').length;
        addNode({
          id: generateId('stage'),
          type: 'stageNode',
          position: { x: Math.round(position.x), y: Math.round(position.y) },
          width: 340,
          height: 280,
          data: {
            title: `Stage ${stageCount + 1}`,
            description: 'New journey milestone',
            stageNumber: stageCount + 1,
            status: 'draft',
            identifier: `STAGE_${stageCount + 1}`,
            color: 'blue',
          },
          style: { width: 340, height: 280 },
        });
      } else if (type === 'ACTIVITY') {
        // Check if dropped inside a Stage
        const stageNodes = nodes.filter((n) => n.type === 'stageNode');
        const targetStage = stageNodes.find(
          (s) =>
            position.x >= s.position.x &&
            position.x <= s.position.x + (s.width ?? 340) &&
            position.y >= s.position.y &&
            position.y <= s.position.y + (s.height ?? 280)
        );

        if (targetStage) {
          const relX = Math.round(position.x - targetStage.position.x);
          const relY = Math.round(position.y - targetStage.position.y);
          const clampedX = Math.max(16, Math.min(relX, (targetStage.width ?? 340) - 272 - 16));
          const clampedY = Math.max(56, Math.min(relY, (targetStage.height ?? 280) - 76 - 16));

          addNode({
            id: generateId('act'),
            type: 'activityNode',
            parentId: targetStage.id,
            position: { x: clampedX, y: clampedY },
            width: 272,
            height: 76,
            data: {
              title: 'New Activity',
              description: 'Process activity step',
              category: 'verification',
              status: 'draft',
              color: (targetStage.data.color as string) || 'blue',
            },
            style: { width: 272, height: 76 },
          });
        } else {
          // Independent activity
          addNode({
            id: generateId('act'),
            type: 'activityNode',
            position: { x: Math.round(position.x), y: Math.round(position.y) },
            width: 272,
            height: 76,
            data: {
              title: 'Independent Activity',
              description: 'Standalone process activity',
              category: 'verification',
              status: 'draft',
              color: 'blue',
            },
            style: { width: 272, height: 76 },
          });
        }
      } else if (type === 'DECISION') {
        addNode({
          id: generateId('dec'),
          type: 'decisionNode',
          position: { x: Math.round(position.x), y: Math.round(position.y) },
          width: 260,
          height: 180,
          data: {
            title: 'Risk Decision',
            description: 'Branching rule evaluation',
            color: 'amber',
            conditions: [
              {
                id: generateId('cond'),
                label: 'Approved',
                expression: 'score >= 700',
                description: 'Meets criteria',
              },
              {
                id: generateId('cond'),
                label: 'Rejected',
                expression: 'score < 700',
                description: 'Fails criteria',
              },
            ],
          },
          style: { width: 260, height: 180 },
        });
      } else if (type === 'NOTE') {
        addNode({
          id: generateId('note'),
          type: 'noteNode',
          position: { x: Math.round(position.x), y: Math.round(position.y) },
          width: 220,
          height: 140,
          data: {
            title: 'Note',
            content: 'Write regulatory guidelines, underwriting notes, or policy details here.',
            color: 'amber',
          },
          style: { width: 220, height: 140 },
        });
      }
    },
    [nodes, addNode, screenToFlowPosition]
  );

  return { onDragOver, onDrop };
}
