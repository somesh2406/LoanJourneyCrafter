export { ExportJourneySchema, JourneySchema } from '@/domain/journey/schemas';
export type ExportJourneyPayload = {
  schemaVersion: '1.0';
  exportedAt: string;
  journey: import('@/domain/journey/types').Journey;
};
