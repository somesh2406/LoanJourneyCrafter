export type MindmapContentType =
  | "text"
  | "formula"
  | "code"
  | "table"
  | "mixed";

export interface MindmapNodeItem {
  id: string;
  label: string;
  parentId: string | null;
  isRoot?: boolean;
  collapsed?: boolean;
  color?: string; // Hex or theme color key for branch
  depth: number;
  order: number;
  content?: string; // Rich markdown body (code blocks, formulas, tables, descriptions)
  contentType?: MindmapContentType;
}

export interface Mindmap {
  id: string;
  title: string;
  description: string;
  rootId: string;
  nodes: MindmapNodeItem[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface MindmapSummary {
  id: string;
  title: string;
  description: string;
  nodeCount: number;
  branchCount: number;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface CreateMindmapInput {
  title: string;
  description?: string;
  initialMarkdown?: string;
}

export interface UpdateMindmapInput {
  title?: string;
  description?: string;
  nodes?: MindmapNodeItem[];
  isPinned?: boolean;
}

export const BRANCH_PALETTES = [
  {
    name: "blue",
    color: "#3b82f6",
    border: "#2563eb",
    bg: "#eff6ff",
    badge: "bg-blue-500 text-white",
  },
  {
    name: "emerald",
    color: "#10b981",
    border: "#059669",
    bg: "#ecfdf5",
    badge: "bg-emerald-500 text-white",
  },
  {
    name: "amber",
    color: "#f59e0b",
    border: "#d97706",
    bg: "#fffbeb",
    badge: "bg-amber-500 text-white",
  },
  {
    name: "purple",
    color: "#8b5cf6",
    border: "#7c3aed",
    bg: "#f5f3ff",
    badge: "bg-purple-500 text-white",
  },
  {
    name: "rose",
    color: "#f43f5e",
    border: "#e11d48",
    bg: "#fff1f2",
    badge: "bg-rose-500 text-white",
  },
  {
    name: "cyan",
    color: "#06b6d4",
    border: "#0891b2",
    bg: "#ecfeff",
    badge: "bg-cyan-500 text-white",
  },
  {
    name: "indigo",
    color: "#6366f1",
    border: "#4f46e5",
    bg: "#eef2ff",
    badge: "bg-indigo-500 text-white",
  },
];

export function getBranchColor(branchIndex: number) {
  return BRANCH_PALETTES[branchIndex % BRANCH_PALETTES.length];
}

/**
 * Detects the dominant content type of a rich markdown body
 */
export function detectContentType(content: string): MindmapContentType {
  const trimmed = content.trim();
  if (trimmed.includes("```")) return "code";
  if (
    trimmed.includes("$$") ||
    trimmed.includes("\\frac") ||
    trimmed.includes("\\sum")
  )
    return "formula";
  if (
    trimmed.startsWith("|") ||
    trimmed.includes("|---|") ||
    (trimmed.includes("|") && trimmed.includes("\n|"))
  )
    return "table";
  return "text";
}

/**
 * Converts a Mindmap tree to indented Markdown compatible with KeenEthics MindMap app format,
 * preserving tables, formulas, and code blocks beneath each node.
 */
export function mindmapToMarkdown(mindmap: Mindmap): string {
  const root = mindmap.nodes.find((n) => n.isRoot || n.parentId === null);
  if (!root) return "";

  const lines: string[] = [`# ${root.label}`];
  if (root.content) {
    const contentLines = root.content.split(/\r?\n/);
    for (const cLine of contentLines) {
      lines.push(`  ${cLine}`);
    }
  }

  function appendChildren(parentId: string, indentLevel: number) {
    const children = mindmap.nodes
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    for (const child of children) {
      const indent = "  ".repeat(indentLevel);
      lines.push(`${indent}- ${child.label}`);
      if (child.content) {
        const contentLines = child.content.split(/\r?\n/);
        for (const cLine of contentLines) {
          lines.push(`${indent}  ${cLine}`);
        }
      }
      appendChildren(child.id, indentLevel + 1);
    }
  }

  appendChildren(root.id, 1);
  return lines.join("\n");
}

/**
 * Parses indented Markdown into a Mindmap object.
 * Supports:
 * - Hierarchy: Headers `# Root`, bullet lists `- Item`, `* Item`
 * - Code Blocks: ```` ```json ... ``` ````
 * - Tables: `| Col 1 | Col 2 |`
 * - Mathematical Formulas: `$$\text{Formula}$$`
 * - Indented Descriptions & Metadata
 */
export function markdownToMindmap(
  markdown: string,
  id = `mindmap-${Date.now()}`,
  defaultTitle?: string,
): Mindmap {
  const lines = markdown.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const now = new Date().toISOString();

  let rootTitle = defaultTitle || "New MindMap";
  const nodes: MindmapNodeItem[] = [];

  const rootId = `${id}-root`;
  let branchCounter = 0;

  // Track parent stack by indent level: [{ level: number, id: string, branchIndex: number }]
  const parentStack: Array<{ level: number; id: string; branchIndex: number }> =
    [];

  let lineStartIndex = 0;

  // Check if first non-empty line is a root title (starts with # or plain text)
  if (lines.length > 0) {
    const firstLine = lines[0];
    const matchHeader = firstLine.match(/^#+\s*(.+)$/);
    if (matchHeader) {
      rootTitle = matchHeader[1].trim();
      lineStartIndex = 1;
    } else if (
      !firstLine.trim().startsWith("-") &&
      !firstLine.trim().startsWith("*")
    ) {
      rootTitle = firstLine.trim();
      lineStartIndex = 1;
    }
  }

  const rootNode: MindmapNodeItem = {
    id: rootId,
    label: rootTitle,
    parentId: null,
    isRoot: true,
    collapsed: false,
    color: "#1e293b",
    depth: 0,
    order: 0,
  };
  nodes.push(rootNode);
  parentStack.push({ level: 0, id: rootId, branchIndex: -1 });

  let autoIdCounter = 1;
  let activeNode: MindmapNodeItem = rootNode;

  let inCodeBlock = false;
  let inFormulaBlock = false;
  const currentContentLines: string[] = [];

  const flushContentToActiveNode = () => {
    if (currentContentLines.length > 0 && activeNode) {
      const combined = currentContentLines.join("\n").trim();
      if (combined) {
        activeNode.content =
          activeNode.content ? `${activeNode.content}\n${combined}` : combined;
        activeNode.contentType = detectContentType(activeNode.content);
      }
      currentContentLines.length = 0;
    }
  };

  for (let i = lineStartIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code fence toggle
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      currentContentLines.push(trimmed);
      if (!inCodeBlock) {
        flushContentToActiveNode();
      }
      continue;
    }

    if (inCodeBlock) {
      currentContentLines.push(rawLine.replace(/^(\s{2,4})/, "")); // strip leading 2-4 spaces
      continue;
    }

    // Check block formula
    if (
      trimmed.startsWith("$$") &&
      trimmed.endsWith("$$") &&
      trimmed.length > 2
    ) {
      currentContentLines.push(trimmed);
      flushContentToActiveNode();
      continue;
    } else if (trimmed.startsWith("$$")) {
      inFormulaBlock = !inFormulaBlock;
      currentContentLines.push(trimmed);
      if (!inFormulaBlock) {
        flushContentToActiveNode();
      }
      continue;
    }

    if (inFormulaBlock) {
      currentContentLines.push(trimmed);
      if (trimmed.endsWith("$$")) {
        inFormulaBlock = false;
        flushContentToActiveNode();
      }
      continue;
    }

    // Check table row
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      currentContentLines.push(trimmed);
      // peek if next line is not a table row
      const nextLine = lines[i + 1]?.trim() || "";
      if (!nextLine.startsWith("|")) {
        flushContentToActiveNode();
      }
      continue;
    }

    // Check if line is a bullet item (new tree node)
    const isBullet = /^[\s\t]*([-*]|\d+\.)\s+/.test(rawLine);

    if (isBullet) {
      flushContentToActiveNode();

      // Calculate indentation level (2 spaces or 1 tab = 1 level)
      const leadingWhitespace = rawLine.match(/^[\s\t]*/)?.[0] || "";
      let spaceCount = 0;
      for (const char of leadingWhitespace) {
        if (char === "\t") spaceCount += 2;
        else spaceCount += 1;
      }
      const indentLevel = Math.max(1, Math.floor(spaceCount / 2) + 1);

      // Clean label
      const label = rawLine.replace(/^[\s\t]*([-*]|\d+\.)\s*/, "").trim();
      if (!label) continue;

      // Find parent from stack
      while (
        parentStack.length > 1 &&
        parentStack[parentStack.length - 1].level >= indentLevel
      ) {
        parentStack.pop();
      }

      const currentParent = parentStack[parentStack.length - 1];
      const parentId = currentParent ? currentParent.id : rootId;
      const isDirectChildOfRoot = parentId === rootId;

      let branchIndex = currentParent.branchIndex;
      if (isDirectChildOfRoot) {
        branchIndex = branchCounter++;
      }

      const palette = getBranchColor(branchIndex >= 0 ? branchIndex : 0);
      const nodeId = `${id}-node-${autoIdCounter++}`;

      const nodeItem: MindmapNodeItem = {
        id: nodeId,
        label,
        parentId,
        isRoot: false,
        collapsed: false,
        color: palette.color,
        depth: indentLevel,
        order: nodes.filter((n) => n.parentId === parentId).length,
      };

      nodes.push(nodeItem);
      parentStack.push({ level: indentLevel, id: nodeId, branchIndex });
      activeNode = nodeItem;
    } else {
      // Line is an unbulleted description/content line belonging to activeNode
      currentContentLines.push(trimmed);
    }
  }

  flushContentToActiveNode();

  return {
    id,
    title: rootTitle,
    description: `Mindmap with ${nodes.length} nodes`,
    rootId,
    nodes,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
  };
}
