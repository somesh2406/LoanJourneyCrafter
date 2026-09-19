import { JourneyRepository } from './journey-repository';
import { LocalJourneyRepository } from './local-journey-repository';
import { ApiJourneyRepository } from './api-journey-repository';

let instance: JourneyRepository | null = null;

export function getJourneyRepository(): JourneyRepository {
  if (!instance) {
    const provider = import.meta.env.VITE_DATA_PROVIDER || 'local';
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Do NOT automatically switch to API just because an API URL exists
    if (provider === 'api' && apiUrl) {
      instance = new ApiJourneyRepository(apiUrl);
    } else {
      instance = new LocalJourneyRepository();
    }
  }
  return instance;
}
