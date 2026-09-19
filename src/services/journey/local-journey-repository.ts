import {
  Journey,
  JourneySummary,
  JourneyTemplate,
  CreateJourneyInput,
  UpdateJourneyInput,
} from '@/domain/journey/types';
import { JourneyRepository } from './journey-repository';
import { StorageProvider } from '../storage/storage-provider';
import { LocalStorageProvider } from '../storage/local-storage';
import { TEMPLATES } from '@/data/templates';
import { generateId } from '@/utils/ids';

const JOURNEYS_INDEX_KEY = 'journeys_index';
const JOURNEY_PREFIX = 'journey_';

export class LocalJourneyRepository implements JourneyRepository {
  private storage: StorageProvider;
  private initialized: boolean = false;

  constructor(storage?: StorageProvider) {
    this.storage = storage ?? new LocalStorageProvider();
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const index = await this.storage.getItem<string[]>(JOURNEYS_INDEX_KEY);
    if (!index || index.length === 0) {
      // Seed initial journeys from templates
      const seedIds: string[] = [];
      for (const t of TEMPLATES) {
        const seedJourney: Journey = {
          ...t.journey,
          id: `journey-${t.id.replace('template-', '')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await this.storage.setItem(`${JOURNEY_PREFIX}${seedJourney.id}`, seedJourney);
        seedIds.push(seedJourney.id);
      }
      await this.storage.setItem(JOURNEYS_INDEX_KEY, seedIds);
    }

    this.initialized = true;
  }

  private journeyToSummary(journey: Journey): JourneySummary {
    const stageCount = journey.nodes.filter((n) => n.type === 'STAGE').length;
    return {
      id: journey.id,
      title: journey.title,
      description: journey.description,
      version: journey.version,
      status: journey.status,
      createdAt: journey.createdAt,
      updatedAt: journey.updatedAt,
      stageCount,
      nodeCount: journey.nodes.length,
      edgeCount: journey.edges.length,
      isPinned: !!journey.isPinned,
    };
  }

  async list(): Promise<JourneySummary[]> {
    await this.ensureInitialized();
    const index = (await this.storage.getItem<string[]>(JOURNEYS_INDEX_KEY)) || [];
    const summaries: JourneySummary[] = [];

    for (const id of index) {
      const journey = await this.storage.getItem<Journey>(`${JOURNEY_PREFIX}${id}`);
      if (journey) {
        summaries.push(this.journeyToSummary(journey));
      }
    }

    // Sort by updatedAt descending
    return summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async get(id: string): Promise<Journey | null> {
    await this.ensureInitialized();
    return await this.storage.getItem<Journey>(`${JOURNEY_PREFIX}${id}`);
  }

  async create(input: CreateJourneyInput): Promise<Journey> {
    await this.ensureInitialized();
    const now = new Date().toISOString();
    const newId = generateId('journey');

    let baseNodes = [];
    let baseEdges = [];
    let baseMeta: Record<string, unknown> = {};

    if (input.templateId) {
      const template = TEMPLATES.find((t) => t.id === input.templateId);
      if (template) {
        baseNodes = JSON.parse(JSON.stringify(template.journey.nodes));
        baseEdges = JSON.parse(JSON.stringify(template.journey.edges));
        baseMeta = JSON.parse(JSON.stringify(template.journey.metadata || {}));
      }
    }

    const newJourney: Journey = {
      id: newId,
      title: input.title.trim() || 'Untitled Journey',
      description: input.description?.trim() || '',
      version: '1.0.0',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      createdBy: 'User',
      updatedBy: 'User',
      nodes: baseNodes,
      edges: baseEdges,
      metadata: baseMeta,
      isPinned: false,
    };

    await this.storage.setItem(`${JOURNEY_PREFIX}${newId}`, newJourney);

    const index = (await this.storage.getItem<string[]>(JOURNEYS_INDEX_KEY)) || [];
    if (!index.includes(newId)) {
      index.unshift(newId);
      await this.storage.setItem(JOURNEYS_INDEX_KEY, index);
    }

    return newJourney;
  }

  async update(id: string, input: UpdateJourneyInput): Promise<Journey> {
    await this.ensureInitialized();
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Journey with ID ${id} not found`);
    }

    const now = new Date().toISOString();
    const updated: Journey = {
      ...existing,
      title: input.title !== undefined ? input.title.trim() : existing.title,
      description: input.description !== undefined ? input.description.trim() : existing.description,
      status: input.status !== undefined ? input.status : existing.status,
      version: input.version !== undefined ? input.version : existing.version,
      nodes: input.nodes !== undefined ? input.nodes : existing.nodes,
      edges: input.edges !== undefined ? input.edges : existing.edges,
      metadata: input.metadata !== undefined ? input.metadata : existing.metadata,
      isPinned: input.isPinned !== undefined ? input.isPinned : existing.isPinned,
      updatedAt: now,
      updatedBy: 'User',
    };

    await this.storage.setItem(`${JOURNEY_PREFIX}${id}`, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();
    await this.storage.removeItem(`${JOURNEY_PREFIX}${id}`);
    const index = (await this.storage.getItem<string[]>(JOURNEYS_INDEX_KEY)) || [];
    const newIndex = index.filter((item) => item !== id);
    await this.storage.setItem(JOURNEYS_INDEX_KEY, newIndex);
    return true;
  }

  async togglePin(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const journey = await this.get(id);
    if (!journey) return false;

    const newPinned = !journey.isPinned;
    await this.update(id, { isPinned: newPinned });
    return newPinned;
  }

  async listTemplates(): Promise<JourneyTemplate[]> {
    return [...TEMPLATES];
  }
}
