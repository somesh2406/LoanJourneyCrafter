import { MindmapRepository } from "./mindmap-repository";
import { LocalMindmapRepository } from "./local-mindmap-repository";

let instance: MindmapRepository | null = null;

export function getMindmapRepository(): MindmapRepository {
  if (!instance) {
    instance = new LocalMindmapRepository();
  }
  return instance;
}
