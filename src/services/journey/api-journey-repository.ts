import {
  Journey,
  JourneySummary,
  JourneyTemplate,
  CreateJourneyInput,
  UpdateJourneyInput,
} from '@/domain/journey/types';
import { JourneyRepository } from './journey-repository';

export class ApiJourneyRepository implements JourneyRepository {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async list(): Promise<JourneySummary[]> {
    const res = await fetch(`${this.baseUrl}/journeys`);
    if (!res.ok) throw new Error(`Failed to fetch journeys: ${res.statusText}`);
    return await res.json();
  }

  async get(id: string): Promise<Journey | null> {
    const res = await fetch(`${this.baseUrl}/journeys/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to get journey ${id}: ${res.statusText}`);
    return await res.json();
  }

  async create(input: CreateJourneyInput): Promise<Journey> {
    const res = await fetch(`${this.baseUrl}/journeys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to create journey: ${res.statusText}`);
    return await res.json();
  }

  async update(id: string, input: UpdateJourneyInput): Promise<Journey> {
    const res = await fetch(`${this.baseUrl}/journeys/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to update journey ${id}: ${res.statusText}`);
    return await res.json();
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/journeys/${id}`, { method: 'DELETE' });
    return res.ok;
  }

  async togglePin(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/journeys/${id}/pin`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to toggle pin: ${res.statusText}`);
    const data = await res.json();
    return !!data.isPinned;
  }

  async listTemplates(): Promise<JourneyTemplate[]> {
    const res = await fetch(`${this.baseUrl}/templates`);
    if (!res.ok) throw new Error(`Failed to fetch templates: ${res.statusText}`);
    return await res.json();
  }
}
