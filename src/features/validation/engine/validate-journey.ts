import { Journey } from '@/domain/journey/types';
import { Condition, DecisionData, NoteData } from '@/domain/nodes/types';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  code: string;
  title: string;
  description: string;
  targetId?: string;
  targetType?: 'node' | 'edge';
}

export interface ValidationReport {
  isValid: boolean;
  isCompliant: boolean;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
}

export function validateJourney(journey: Journey): ValidationReport {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map<string, (typeof journey.nodes)[0]>();
  const seenNodeIds = new Set<string>();

  // 1. Check duplicate Node IDs and build nodeMap
  for (const node of journey.nodes) {
    if (seenNodeIds.has(node.id)) {
      issues.push({
        id: `dup-${node.id}`,
        severity: 'error',
        code: 'DUPLICATE_NODE_ID',
        title: 'Duplicate Node ID Detected',
        description: `Node ID "${node.id}" is declared more than once in the journey graph.`,
        targetId: node.id,
        targetType: 'node',
      });
    } else {
      seenNodeIds.add(node.id);
      nodeMap.set(node.id, node);
    }
  }

  // 2. Check Node attributes, Parent hierarchy & Geometry
  for (const node of journey.nodes) {
    // Missing title check
    const title = node.data.title?.trim();
    if (!title || title === 'Untitled' || title === 'Untitled Stage' || title === 'Untitled Activity') {
      issues.push({
        id: `missing-title-${node.id}`,
        severity: 'warning',
        code: 'MISSING_TITLE',
        title: 'Missing Component Title',
        description: `The ${node.type} component has no descriptive business title.`,
        targetId: node.id,
        targetType: 'node',
      });
    }

    // Parent ID validity & bounds
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (!parent) {
        issues.push({
          id: `invalid-parent-${node.id}`,
          severity: 'error',
          code: 'INVALID_PARENT',
          title: 'Orphaned Child Activity',
          description: `Activity "${title || node.id}" references parent ID "${node.parentId}" which does not exist.`,
          targetId: node.id,
          targetType: 'node',
        });
      } else if (parent.type !== 'STAGE') {
        issues.push({
          id: `non-stage-parent-${node.id}`,
          severity: 'error',
          code: 'INVALID_PARENT_TYPE',
          title: 'Invalid Parent Type',
          description: `Activity "${title || node.id}" has parent "${parent.id}" which is a ${parent.type}, not a STAGE.`,
          targetId: node.id,
          targetType: 'node',
        });
      } else {
        // Geometric check: Is child positioned outside parent bounds?
        const childW = node.size?.width || 220;
        const childH = node.size?.height || 76;
        const parentW = parent.size?.width || 340;
        const parentH = parent.size?.height || 280;

        if (
          node.position.x < 0 ||
          node.position.y < 0 ||
          node.position.x + childW > parentW + 10 ||
          node.position.y + childH > parentH + 10
        ) {
          issues.push({
            id: `outside-bounds-${node.id}`,
            severity: 'error',
            code: 'CHILD_OUTSIDE_BOUNDS',
            title: 'Activity Outside Stage Bounds',
            description: `Activity "${title || node.id}" is positioned at (${node.position.x}, ${node.position.y}) which extends outside its parent Stage bounds (${parentW}x${parentH}).`,
            targetId: node.id,
            targetType: 'node',
          });
        }
      }
    }

    // Stage specifics: Stage without activities
    if (node.type === 'STAGE') {
      const children = journey.nodes.filter((n) => n.parentId === node.id);
      if (children.length === 0) {
        issues.push({
          id: `empty-stage-${node.id}`,
          severity: 'warning',
          code: 'EMPTY_STAGE',
          title: 'Stage Without Activities',
          description: `Stage "${title || node.id}" contains zero process activities. Add at least one activity.`,
          targetId: node.id,
          targetType: 'node',
        });
      }
    }

    // Decision specifics
    if (node.type === 'DECISION') {
      const decData = node.data as DecisionData;
      const conditions = decData.conditions || [];
      const outgoingEdges = journey.edges.filter((e) => e.source === node.id);

      if (conditions.length === 0 && outgoingEdges.length === 0) {
        issues.push({
          id: `decision-no-outgoing-${node.id}`,
          severity: 'warning',
          code: 'DECISION_NO_BRANCH',
          title: 'Decision Without Outgoing Branches',
          description: `Decision point "${title || node.id}" has no outgoing path connected.`,
          targetId: node.id,
          targetType: 'node',
        });
      } else if (conditions.length > 0) {
        // Check that conditions have labels
        for (const cond of conditions) {
          if (!cond.label?.trim()) {
            issues.push({
              id: `cond-missing-label-${node.id}-${cond.id}`,
              severity: 'error',
              code: 'INVALID_CONDITION',
              title: 'Condition Missing Label',
              description: `A branch condition in decision "${title || node.id}" has an empty label.`,
              targetId: node.id,
              targetType: 'node',
            });
          }
        }
      }
    }

    // Note specifics: Empty note check (notes are NOT errors if standalone!)
    if (node.type === 'NOTE') {
      const noteData = node.data as NoteData;
      if (!noteData.content?.trim()) {
        issues.push({
          id: `empty-note-${node.id}`,
          severity: 'warning',
          code: 'EMPTY_NOTE',
          title: 'Empty Annotation Note',
          description: `Note "${title || node.id}" has no written content.`,
          targetId: node.id,
          targetType: 'node',
        });
      }
    }
  }

  // 3. Check Edge validity & condition mapping
  for (const edge of journey.edges) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode) {
      issues.push({
        id: `broken-edge-src-${edge.id}`,
        severity: 'error',
        code: 'BROKEN_EDGE_SOURCE',
        title: 'Broken Connection Source',
        description: `Connection references source node ID "${edge.source}" which does not exist.`,
        targetId: edge.id,
        targetType: 'edge',
      });
    }

    if (!targetNode) {
      issues.push({
        id: `broken-edge-tgt-${edge.id}`,
        severity: 'error',
        code: 'BROKEN_EDGE_TARGET',
        title: 'Broken Connection Target',
        description: `Connection references target node ID "${edge.target}" which does not exist.`,
        targetId: edge.id,
        targetType: 'edge',
      });
    }

    // Check condition handle consistency
    if (sourceNode && sourceNode.type === 'DECISION') {
      const decData = sourceNode.data as DecisionData;
      const conditions = decData.conditions || [];

      if (edge.conditionId) {
        const foundCond = conditions.find((c: Condition) => c.id === edge.conditionId);
        if (!foundCond) {
          issues.push({
            id: `invalid-condition-edge-${edge.id}`,
            severity: 'error',
            code: 'INVALID_CONDITION_EDGE',
            title: 'Mismatched Branch Condition Edge',
            description: `Connection references condition ID "${edge.conditionId}" which does not exist on decision "${sourceNode.data.title || sourceNode.id}".`,
            targetId: edge.id,
            targetType: 'edge',
          });
        }
      }
    }
  }

  // 4. Graph connectivity warnings (disconnected stages and independent activities)
  for (const node of journey.nodes) {
    if (node.type === 'STAGE') {
      const hasEdge = journey.edges.some((e) => e.source === node.id || e.target === node.id);
      if (!hasEdge && journey.nodes.filter((n) => n.type === 'STAGE').length > 1) {
        issues.push({
          id: `disc-stage-${node.id}`,
          severity: 'warning',
          code: 'DISCONNECTED_STAGE',
          title: 'Disconnected Stage Milestone',
          description: `Stage "${node.data.title || node.id}" is completely disconnected from the journey flow.`,
          targetId: node.id,
          targetType: 'node',
        });
      }
    } else if (node.type === 'ACTIVITY' && !node.parentId) {
      // Independent activity without edges
      const hasEdge = journey.edges.some((e) => e.source === node.id || e.target === node.id);
      if (!hasEdge) {
        issues.push({
          id: `disc-activity-${node.id}`,
          severity: 'warning',
          code: 'DISCONNECTED_ACTIVITY',
          title: 'Disconnected Independent Activity',
          description: `Standalone activity "${node.data.title || node.id}" is not nested in a Stage and has no connections.`,
          targetId: node.id,
          targetType: 'node',
        });
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    isValid: errorCount === 0,
    isCompliant: errorCount === 0 && warningCount === 0,
    errorCount,
    warningCount,
    issues,
  };
}
