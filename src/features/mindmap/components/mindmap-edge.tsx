import { type EdgeProps, getBezierPath, Position } from "@xyflow/react";

export function MindmapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  data,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const strokeColor = (data?.color as string | undefined) || "#94a3b8";

  return (
    <>
      {/* Invisible wider hit area */}
      <path
        id={`${id}-hit`}
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        className="react-flow__edge-interaction"
      />
      {/* Visible curved stroke */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? 3.5 : 2.5}
        strokeLinecap="round"
        strokeOpacity={selected ? 1 : 0.85}
        className="transition-all duration-150"
      />
    </>
  );
}
