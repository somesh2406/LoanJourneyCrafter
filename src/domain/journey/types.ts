import { JourneyNode } from '../nodes/types';
import { JourneyEdge } from '../edges/types';

export type JourneyStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface Journey {
  id: string;
  title: string;
  description: string;
  version: string;
  status: JourneyStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  metadata: Record<string, unknown>;
  isPinned?: boolean;
}

export interface JourneySummary {
  id: string;
  title: string;
  description: string;
  version: string;
  status: JourneyStatus;
  createdAt: string;
  updatedAt: string;
  stageCount: number;
  nodeCount: number;
  edgeCount: number;
  isPinned: boolean;
}

export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  badge: string;
  journey: Journey;
}

export interface CreateJourneyInput {
  title: string;
  description?: string;
  templateId?: string;
}

export interface UpdateJourneyInput {
  title?: string;
  description?: string;
  status?: JourneyStatus;
  version?: string;
  nodes?: JourneyNode[];
  edges?: JourneyEdge[];
  metadata?: Record<string, unknown>;
  isPinned?: boolean;
}
