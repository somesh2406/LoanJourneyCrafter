import { StorageProvider } from './storage-provider';

export class LocalStorageProvider implements StorageProvider {
  private prefix: string;

  constructor(prefix: string = 'loan_studio_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`Failed to read key ${key} from localStorage:`, e);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (e) {
      console.error(`Failed to save key ${key} to localStorage:`, e);
      throw new Error(`LocalStorage write failed: ${(e as Error).message}`);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (e) {
      console.error(`Failed to remove key ${key} from localStorage:`, e);
    }
  }

  async clear(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k);
      }
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
  }

  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keys.push(k.slice(this.prefix.length));
        }
      }
    } catch (e) {
      console.error('Failed to enumerate localStorage keys:', e);
    }
    return keys;
  }
}
