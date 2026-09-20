import {
  Mindmap,
  MindmapSummary,
  CreateMindmapInput,
  UpdateMindmapInput,
} from "@/domain/mindmap/types";

export interface MindmapRepository {
  list(): Promise<MindmapSummary[]>;
  get(id: string): Promise<Mindmap | null>;
  create(input: CreateMindmapInput): Promise<Mindmap>;
  update(id: string, input: UpdateMindmapInput): Promise<Mindmap>;
  delete(id: string): Promise<boolean>;
  togglePin(id: string): Promise<boolean>;
}
