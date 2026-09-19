import { ThemeColor } from '@/config/colors';

export type NodeType = 'STAGE' | 'ACTIVITY' | 'DECISION' | 'NOTE';

export type JourneyNodeStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'deprecated';

export type ActivityCategory =
  | 'verification'
  | 'documentation'
  | 'underwriting'
  | 'disbursement'
  | 'servicing'
  | 'custom';

export interface BaseNodeData {
  title: string;
  description?: string;
  color?: ThemeColor;
}

export interface StageData extends BaseNodeData {
  stageNumber: number;
  status: JourneyNodeStatus;
  identifier: string;
  isCollapsed?: boolean;
}

export interface ActivityData extends BaseNodeData {
  category: ActivityCategory;
  status: JourneyNodeStatus;
}

export interface Condition {
  id: string;
  label: string;
  expression: string;
  description?: string;
}

export interface DecisionData extends BaseNodeData {
  conditions: Condition[];
}

export interface NoteData extends BaseNodeData {
  content: string;
}

export type JourneyNodeData = StageData | ActivityData | DecisionData | NoteData;

export interface JourneyNode<TData extends JourneyNodeData = JourneyNodeData> {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  parentId?: string | null;
  data: TData;
  style?: Record<string, unknown>;
}
