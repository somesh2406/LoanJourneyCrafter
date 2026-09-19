export interface JourneyEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string | null;
  conditionId?: string | null;
  style?: Record<string, unknown>;
}
