export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function rectOverlap(r1: Rect, r2: Rect): boolean {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

/**
 * Calculates the minimum width and height for a Stage based on the positions and sizes of its children.
 */
export function calculateStageChildrenBounds(
  children: Array<{
    position: { x: number; y: number };
    size?: { width: number; height: number };
    width?: number;
    height?: number;
  }>,
  padding: number = 24,
  headerHeight: number = 56,
  minWidthFallback: number = 320,
  minHeightFallback: number = 200
): { minWidth: number; minHeight: number; maxX: number; maxY: number } {
  if (!children || children.length === 0) {
    return {
      minWidth: minWidthFallback,
      minHeight: minHeightFallback,
      maxX: 0,
      maxY: 0,
    };
  }

  let maxRight = 0;
  let maxBottom = 0;

  for (const child of children) {
    const w = child.size?.width ?? child.width ?? 220;
    const h = child.size?.height ?? child.height ?? 80;
    const right = child.position.x + w;
    const bottom = child.position.y + h;

    if (right > maxRight) maxRight = right;
    if (bottom > maxBottom) maxBottom = bottom;
  }

  const calculatedWidth = Math.max(minWidthFallback, maxRight + padding);
  const calculatedHeight = Math.max(minHeightFallback, Math.max(maxBottom + padding, headerHeight + 100));

  return {
    minWidth: calculatedWidth,
    minHeight: calculatedHeight,
    maxX: maxRight,
    maxY: maxBottom,
  };
}

/**
 * Converts parent-relative coordinates to absolute canvas coordinates
 */
export function relToAbs(relPos: Point, parentAbsPos: Point): Point {
  return {
    x: parentAbsPos.x + relPos.x,
    y: parentAbsPos.y + relPos.y,
  };
}

/**
 * Converts absolute canvas coordinates to parent-relative coordinates
 */
export function absToRel(absPos: Point, parentAbsPos: Point): Point {
  return {
    x: absPos.x - parentAbsPos.x,
    y: absPos.y - parentAbsPos.y,
  };
}
