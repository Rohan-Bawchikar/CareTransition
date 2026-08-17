import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public static readonly KEYS = {
    PATIENTS: 'caretransition_patients',
    MEDICATIONS: 'caretransition_medications',
    FOLLOW_UPS: 'caretransition_followups',
    RECOVERY_TASKS: 'caretransition_tasks',
    DISCHARGE_PLANS: 'caretransition_discharge_plans',
    INITIALIZED: 'caretransition_initialized_v3'
  } as const;

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return defaultValue;
      }
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[StorageService] Failed to read key "${key}" from localStorage:`, e);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[StorageService] Failed to save key "${key}" to localStorage:`, e);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[StorageService] Failed to remove key "${key}":`, e);
    }
  }

  clearAll(): void {
    try {
      Object.values(StorageService.KEYS).forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('[StorageService] Failed to clear CareTransition storage:', e);
    }
  }

  isInitialized(): boolean {
    return localStorage.getItem(StorageService.KEYS.INITIALIZED) === 'true';
  }

  markInitialized(): void {
    localStorage.setItem(StorageService.KEYS.INITIALIZED, 'true');
  }
}
