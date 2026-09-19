import {
  Journey,
  JourneySummary,
  JourneyTemplate,
  CreateJourneyInput,
  UpdateJourneyInput,
} from '@/domain/journey/types';

export interface JourneyRepository {
  list(): Promise<JourneySummary[]>;
  get(id: string): Promise<Journey | null>;
  create(input: CreateJourneyInput): Promise<Journey>;
  update(id: string, input: UpdateJourneyInput): Promise<Journey>;
  delete(id: string): Promise<boolean>;
  togglePin(id: string): Promise<boolean>;
  listTemplates(): Promise<JourneyTemplate[]>;
}
