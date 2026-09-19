import { type Node as FlowNode, type Edge as FlowEdge, MarkerType } from '@xyflow/react';
import { Journey, JourneyStatus } from './types';
import { JourneyNode, NodeType, JourneyNodeData } from '../nodes/types';
import { JourneyEdge } from '../edges/types';

export interface EditorNodeData extends Record<string, unknown> {
  title: string;
  description?: string;
  color?: string;
  [key: string]: unknown;
}

export type EditorNode = FlowNode<EditorNodeData>;
export type EditorEdge = FlowEdge<{ conditionId?: string | null; label?: string | null }>;

const NODE_TYPE_DOMAIN_TO_FLOW: Record<NodeType, string> = {
  STAGE: 'stageNode',
  ACTIVITY: 'activityNode',
  DECISION: 'decisionNode',
  NOTE: 'noteNode',
};

const NODE_TYPE_FLOW_TO_DOMAIN: Record<string, NodeType> = {
  stageNode: 'STAGE',
  activityNode: 'ACTIVITY',
  decisionNode: 'DECISION',
  noteNode: 'NOTE',
};

const DEFAULT_NODE_SIZES: Record<NodeType, { width: number; height: number }> = {
  STAGE: { width: 340, height: 280 },
  ACTIVITY: { width: 220, height: 74 },
  DECISION: { width: 240, height: 160 },
  NOTE: { width: 220, height: 140 },
};

/**
 * Converts pure Domain Journey into React Flow editor state
 */
export function journeyToEditorState(journey: Journey): {
  nodes: EditorNode[];
  edges: EditorEdge[];
} {
  // Identify collapsed stages to hide their children
  const collapsedStageIds = new Set<string>();
  for (const node of journey.nodes) {
    if (node.type === 'STAGE' && (node.data as { isCollapsed?: boolean }).isCollapsed) {
      collapsedStageIds.add(node.id);
    }
  }

  const nodes: EditorNode[] = journey.nodes.map((node) => {
    const flowType = NODE_TYPE_DOMAIN_TO_FLOW[node.type] || 'stageNode';
    const isInsideCollapsed = node.parentId ? collapsedStageIds.has(node.parentId) : false;

    return {
      id: node.id,
      type: flowType,
      position: { ...node.position },
      parentId: node.parentId || undefined,
      hidden: isInsideCollapsed,
      data: {
        ...(node.data as unknown as EditorNodeData),
      },
      style: {
        width: node.size.width,
        height: node.size.height,
        ...(node.style || {}),
      },
      width: node.size.width,
      height: node.size.height,
    };
  });

  const edges: EditorEdge[] = journey.edges.map((edge) => {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined,
      type: 'journeyEdge',
      data: {
        conditionId: edge.conditionId || null,
        label: edge.label || null,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: '#64748b',
      },
    };
  });

  return { nodes, edges };
}

/**
 * Converts React Flow editor state into pure Domain Journey
 */
export function editorStateToJourney(
  nodes: EditorNode[],
  edges: EditorEdge[],
  existingJourney: Journey | {
    id: string;
    title: string;
    description: string;
    version: string;
    status: JourneyStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    metadata?: Record<string, unknown>;
    isPinned?: boolean;
  }
): Journey {
  const domainNodes: JourneyNode[] = nodes.map((flowNode) => {
    const domainType = NODE_TYPE_FLOW_TO_DOMAIN[flowNode.type || ''] || 'STAGE';
    const defaultSize = DEFAULT_NODE_SIZES[domainType];

    // Priority for width/height: style.width -> measured.width -> width -> default
    let width = defaultSize.width;
    let height = defaultSize.height;

    if (typeof flowNode.style?.width === 'number') {
      width = flowNode.style.width;
    } else if (typeof flowNode.width === 'number') {
      width = flowNode.width;
    } else if (flowNode.measured?.width) {
      width = flowNode.measured.width;
    }

    if (typeof flowNode.style?.height === 'number') {
      height = flowNode.style.height;
    } else if (typeof flowNode.height === 'number') {
      height = flowNode.height;
    } else if (flowNode.measured?.height) {
      height = flowNode.measured.height;
    }

    const { ...nodeData } = flowNode.data;

    return {
      id: flowNode.id,
      type: domainType,
      position: {
        x: Math.round(flowNode.position.x),
        y: Math.round(flowNode.position.y),
      },
      size: {
        width: Math.round(width),
        height: Math.round(height),
      },
      parentId: flowNode.parentId || null,
      data: nodeData as unknown as JourneyNodeData,
      style: flowNode.style ? { ...flowNode.style } : undefined,
    };
  });

  const domainEdges: JourneyEdge[] = edges.map((flowEdge) => {
    return {
      id: flowEdge.id,
      source: flowEdge.source,
      target: flowEdge.target,
      sourceHandle: flowEdge.sourceHandle || null,
      targetHandle: flowEdge.targetHandle || null,
      label: flowEdge.data?.label || (typeof flowEdge.label === 'string' ? flowEdge.label : null),
      conditionId: flowEdge.data?.conditionId || null,
      style: flowEdge.style ? { ...flowEdge.style } : undefined,
    };
  });

  return {
    id: existingJourney.id,
    title: existingJourney.title,
    description: existingJourney.description,
    version: existingJourney.version,
    status: existingJourney.status,
    createdAt: existingJourney.createdAt,
    updatedAt: new Date().toISOString(),
    createdBy: existingJourney.createdBy,
    updatedBy: 'System',
    nodes: domainNodes,
    edges: domainEdges,
    metadata: existingJourney.metadata || {},
    isPinned: existingJourney.isPinned,
  };
}
