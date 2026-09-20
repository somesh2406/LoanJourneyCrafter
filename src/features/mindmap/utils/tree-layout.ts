import { type Node as FlowNode, type Edge as FlowEdge } from "@xyflow/react";
import {
  MindmapNodeItem,
  MindmapContentType,
  getBranchColor,
} from "@/domain/mindmap/types";

export interface MindmapFlowData extends Record<string, unknown> {
  id: string;
  label: string;
  isRoot: boolean;
  depth: number;
  color: string;
  collapsed: boolean;
  childCount: number;
  hasChildren: boolean;
  parentId: string | null;
  content?: string;
  contentType?: MindmapContentType;
}

export type MindmapFlowNode = FlowNode<MindmapFlowData, "mindmapNode">;
export type MindmapFlowEdge = FlowEdge<{ color: string }>;

interface LayoutNode {
  item: MindmapNodeItem;
  children: LayoutNode[];
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight: number;
  totalDirectChildren: number;
}

const ROOT_WIDTH = 240;
const ROOT_HEIGHT = 56;

const BRANCH_WIDTH = 210;
const BRANCH_HEIGHT = 46;

const LEAF_WIDTH = 190;
const LEAF_HEIGHT = 42;

const X_GAP = 85;
const Y_GAP = 24;

function getNodeDimensions(
  depth: number,
  isRoot: boolean,
  item?: MindmapNodeItem,
): { width: number; height: number } {
  let width =
    isRoot || depth === 0 ? ROOT_WIDTH
    : depth === 1 ? BRANCH_WIDTH
    : LEAF_WIDTH;
  let height =
    isRoot || depth === 0 ? ROOT_HEIGHT
    : depth === 1 ? BRANCH_HEIGHT
    : LEAF_HEIGHT;

  if (item?.content && item.content.trim()) {
    const type = item.contentType || "text";
    if (type === "table") {
      width = Math.max(width, 360);
      const rows = item.content
        .split("\n")
        .filter((l) => l.trim().startsWith("|")).length;
      height = Math.max(height, 52 + Math.min(rows * 26, 200));
    } else if (type === "code") {
      width = Math.max(width, 320);
      const lines = item.content.split("\n").length;
      height = Math.max(height, 52 + Math.min(lines * 20, 180));
    } else if (type === "formula") {
      width = Math.max(width, 280);
      height = Math.max(height, 95);
    } else {
      width = Math.max(width, 260);
      height = Math.max(height, 80);
    }
  }

  return { width, height };
}

export function computeMindmapLayout(nodeItems: MindmapNodeItem[]): {
  flowNodes: MindmapFlowNode[];
  flowEdges: MindmapFlowEdge[];
} {
  if (nodeItems.length === 0) {
    return { flowNodes: [], flowEdges: [] };
  }

  // Find root
  const rootItem =
    nodeItems.find((n) => n.isRoot || n.parentId === null) || nodeItems[0];

  // Map of parentId -> children
  const childrenMap = new Map<string, MindmapNodeItem[]>();
  for (const n of nodeItems) {
    if (n.parentId) {
      const list = childrenMap.get(n.parentId) || [];
      list.push(n);
      childrenMap.set(n.parentId, list);
    }
  }

  // Sort children by order
  for (const list of childrenMap.values()) {
    list.sort((a, b) => a.order - b.order);
  }

  // Build LayoutNode tree
  let branchIndexCounter = 0;

  function buildLayoutNode(
    item: MindmapNodeItem,
    depth: number,
    inheritedColor?: string,
  ): LayoutNode {
    const isRoot = item.id === rootItem.id;
    const { width, height } = getNodeDimensions(depth, isRoot, item);

    let nodeColor = item.color;
    if (isRoot) {
      nodeColor = "#1e293b";
    } else if (depth === 1) {
      const palette = getBranchColor(branchIndexCounter++);
      nodeColor = item.color || palette.color;
    } else {
      nodeColor = inheritedColor || item.color || "#3b82f6";
    }

    const allChildren = childrenMap.get(item.id) || [];
    const isCollapsed = !!item.collapsed;

    // If collapsed, don't layout children
    const visibleChildren: LayoutNode[] = [];
    if (!isCollapsed) {
      for (const child of allChildren) {
        visibleChildren.push(buildLayoutNode(child, depth + 1, nodeColor));
      }
    }

    return {
      item,
      children: visibleChildren,
      color: nodeColor,
      x: 0,
      y: 0,
      width,
      height,
      subtreeHeight: 0,
      totalDirectChildren: allChildren.length,
    };
  }

  const rootLayoutNode = buildLayoutNode(rootItem, 0);

  // Calculate subtree heights bottom-up
  function calcSubtreeHeight(node: LayoutNode): number {
    if (node.children.length === 0) {
      node.subtreeHeight = node.height + Y_GAP;
      return node.subtreeHeight;
    }

    let sum = 0;
    for (const child of node.children) {
      sum += calcSubtreeHeight(child);
    }
    node.subtreeHeight = Math.max(node.height + Y_GAP, sum);
    return node.subtreeHeight;
  }

  calcSubtreeHeight(rootLayoutNode);

  // Position nodes top-down
  rootLayoutNode.x = 0;
  rootLayoutNode.y = 0;

  function positionChildren(parent: LayoutNode) {
    if (parent.children.length === 0) return;

    const totalChildrenHeight = parent.children.reduce(
      (acc, c) => acc + c.subtreeHeight,
      0,
    );
    const parentCenterY = parent.y + parent.height / 2;
    let currentY = parentCenterY - totalChildrenHeight / 2;

    for (const child of parent.children) {
      child.x = parent.x + parent.width + X_GAP;
      const childCenterY = currentY + child.subtreeHeight / 2;
      child.y = childCenterY - child.height / 2;
      currentY += child.subtreeHeight;

      positionChildren(child);
    }
  }

  positionChildren(rootLayoutNode);

  // Flatten tree into FlowNodes & FlowEdges
  const flowNodes: MindmapFlowNode[] = [];
  const flowEdges: MindmapFlowEdge[] = [];

  function collect(node: LayoutNode) {
    flowNodes.push({
      id: node.item.id,
      type: "mindmapNode",
      position: { x: Math.round(node.x), y: Math.round(node.y) },
      data: {
        id: node.item.id,
        label: node.item.label,
        isRoot: node.item.id === rootItem.id,
        depth: node.item.depth,
        color: node.color,
        collapsed: !!node.item.collapsed,
        childCount: node.totalDirectChildren,
        hasChildren: node.totalDirectChildren > 0,
        parentId: node.item.parentId,
        content: node.item.content,
        contentType: node.item.contentType,
      },
    });

    for (const child of node.children) {
      flowEdges.push({
        id: `e-${node.item.id}-${child.item.id}`,
        source: node.item.id,
        target: child.item.id,
        type: "mindmapEdge",
        data: {
          color: child.color,
        },
      });
      collect(child);
    }
  }

  collect(rootLayoutNode);

  return { flowNodes, flowEdges };
}
