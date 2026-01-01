import { AppData, Resolution } from './types';

const STORAGE_KEY = 'ngine_data';

export const storage = {
  load(): AppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    return { resolution: null };
  },

  save(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

