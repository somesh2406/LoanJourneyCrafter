import { z } from 'zod';

export const ThemeColorSchema = z.enum([
  'neutral',
  'blue',
  'green',
  'amber',
  'red',
  'purple',
  'cyan',
]);

export const NodeTypeSchema = z.enum(['STAGE', 'ACTIVITY', 'DECISION', 'NOTE']);

export const JourneyNodeStatusSchema = z.enum([
  'draft',
  'in_progress',
  'review',
  'completed',
  'deprecated',
]);

export const ActivityCategorySchema = z.enum([
  'verification',
  'documentation',
  'underwriting',
  'disbursement',
  'servicing',
  'custom',
]);

export const ConditionSchema = z.object({
  id: z.string().min(1, 'Condition ID is required'),
  label: z.string().min(1, 'Condition label is required'),
  expression: z.string().default(''),
  description: z.string().optional(),
});

export const BaseNodeDataSchema = z.object({
  title: z.string().default('Untitled'),
  description: z.string().optional(),
  color: ThemeColorSchema.optional(),
});

export const StageDataSchema = BaseNodeDataSchema.extend({
  stageNumber: z.number().int().nonnegative().default(1),
  status: JourneyNodeStatusSchema.default('draft'),
  identifier: z.string().default('STAGE'),
  isCollapsed: z.boolean().optional(),
});

export const ActivityDataSchema = BaseNodeDataSchema.extend({
  category: ActivityCategorySchema.default('verification'),
  status: JourneyNodeStatusSchema.default('draft'),
});

export const DecisionDataSchema = BaseNodeDataSchema.extend({
  conditions: z.array(ConditionSchema).default([]),
});

export const NoteDataSchema = BaseNodeDataSchema.extend({
  content: z.string().default(''),
});

export const JourneyNodeDataSchema = z.union([
  StageDataSchema,
  ActivityDataSchema,
  DecisionDataSchema,
  NoteDataSchema,
]);

export const JourneyNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  type: NodeTypeSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  parentId: z.string().nullable().optional(),
  data: z.record(z.string(), z.unknown()),
  style: z.record(z.string(), z.unknown()).optional(),
});

export const JourneyEdgeSchema = z.object({
  id: z.string().min(1, 'Edge ID is required'),
  source: z.string().min(1, 'Source node ID is required'),
  target: z.string().min(1, 'Target node ID is required'),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  conditionId: z.string().nullable().optional(),
  style: z.record(z.string(), z.unknown()).optional(),
});

export const JourneyStatusSchema = z.enum(['draft', 'in_review', 'published', 'archived']);

export const JourneySchema = z.object({
  id: z.string().min(1, 'Journey ID is required'),
  title: z.string().min(1, 'Journey title is required'),
  description: z.string().default(''),
  version: z.string().default('1.0.0'),
  status: JourneyStatusSchema.default('draft'),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().default('System'),
  updatedBy: z.string().default('System'),
  nodes: z.array(JourneyNodeSchema).default([]),
  edges: z.array(JourneyEdgeSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
  isPinned: z.boolean().optional(),
});

export const ExportJourneySchema = z.object({
  schemaVersion: z.literal('1.0'),
  exportedAt: z.string(),
  journey: JourneySchema,
});
