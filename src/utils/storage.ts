// Local Storage Utilities

import { Job } from '../types';

const STORAGE_KEYS = {
  JOBS: 'nexus_jobs',
  ROLE: 'nexus_role',
  SETTINGS: 'nexus_settings',
} as const;

export const storage = {
  // Jobs
  getJobs: (): Job[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load jobs from storage:', error);
      return [];
    }
  },

  saveJobs: (jobs: Job[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (error) {
      console.error('Failed to save jobs to storage:', error);
    }
  },

  // Role
  getRole: (): 'tech' | 'manager' => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (saved as 'tech' | 'manager') || 'tech';
    } catch (error) {
      return 'tech';
    }
  },

  saveRole: (role: 'tech' | 'manager'): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  },

  // Clear all
  clearAll: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};

// Generic storage service for other modules
export const storageService = {
  get: <T>(key: string): T | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
    }
  },
};
