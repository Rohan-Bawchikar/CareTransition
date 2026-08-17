import { Injectable, signal, inject } from '@angular/core';
import { DischargePlan } from '../models/discharge-plan.model';
import { StorageService } from './storage.service';
import { getInitialDischargePlans } from '../data/seed-data';

@Injectable({
  providedIn: 'root'
})
export class DischargePlanService {
  private storage = inject(StorageService);

  readonly dischargePlans = signal<DischargePlan[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (!this.storage.isInitialized()) {
      const initial = getInitialDischargePlans();
      this.dischargePlans.set(initial);
      this.saveToStorage(initial);
      this.storage.markInitialized();
      return;
    }
    const saved = this.storage.getItem<DischargePlan[]>(StorageService.KEYS.DISCHARGE_PLANS, []);
    if (saved && saved.length > 0) {
      this.dischargePlans.set(saved);
    } else {
      const initial = getInitialDischargePlans();
      this.dischargePlans.set(initial);
      this.saveToStorage(initial);
    }
  }

  private saveToStorage(data: DischargePlan[]): void {
    this.storage.setItem(StorageService.KEYS.DISCHARGE_PLANS, data);
  }

  getDischargePlans(): DischargePlan[] {
    return this.dischargePlans();
  }

  getPlanByPatientId(patientId: string): DischargePlan | undefined {
    return this.dischargePlans().find(p => p.patientId === patientId);
  }

  getDischargePlanById(id: string): DischargePlan | undefined {
    return this.dischargePlans().find(p => p.id === id);
  }

  addDischargePlan(planData: Omit<DischargePlan, 'id'> | DischargePlan): DischargePlan {
    const newPlan: DischargePlan = {
      ...planData,
      id: 'id' in planData && planData.id ? planData.id : `plan-${Date.now()}`
    };
    this.dischargePlans.update(current => {
      const updated = [newPlan, ...current];
      this.saveToStorage(updated);
      return updated;
    });
    return newPlan;
  }

  updateDischargePlan(id: string, updates: Partial<DischargePlan>): DischargePlan | undefined {
    let updatedPlan: DischargePlan | undefined;
    this.dischargePlans.update(current => {
      const index = current.findIndex(p => p.id === id);
      if (index === -1) return current;
      updatedPlan = { ...current[index], ...updates };
      const updated = [...current];
      updated[index] = updatedPlan;
      this.saveToStorage(updated);
      return updated;
    });
    return updatedPlan;
  }

  savePlan(plan: DischargePlan): void {
    this.dischargePlans.update(current => {
      const index = current.findIndex(p => p.patientId === plan.patientId);
      let updated: DischargePlan[];
      if (index >= 0) {
        updated = [...current];
        updated[index] = plan;
      } else {
        updated = [plan, ...current];
      }
      this.saveToStorage(updated);
      return updated;
    });
  }

  deleteByPatientId(patientId: string): void {
    this.dischargePlans.update(current => {
      const filtered = current.filter(p => p.patientId !== patientId);
      this.saveToStorage(filtered);
      return filtered;
    });
  }

  resetToDefaults(): void {
    const initial = getInitialDischargePlans();
    this.dischargePlans.set(initial);
    this.saveToStorage(initial);
  }
}
