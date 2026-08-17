import { Injectable, signal, inject } from '@angular/core';
import { FollowUp, FollowUpStatus } from '../models/follow-up.model';
import { StorageService } from './storage.service';
import { getInitialFollowUps } from '../data/seed-data';
import { getAppCurrentDate, parseLocalDate } from '../utils/date-utils';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {
  private storage = inject(StorageService);

  readonly followUps = signal<FollowUp[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    let dataToUse: FollowUp[] = [];
    if (!this.storage.isInitialized()) {
      dataToUse = getInitialFollowUps();
    } else {
      const saved = this.storage.getItem<FollowUp[]>(StorageService.KEYS.FOLLOW_UPS, []);
      if (saved && saved.length > 0) {
        dataToUse = saved;
      } else {
        dataToUse = getInitialFollowUps();
      }
    }

    // Harmonize overdue statuses with current date
    const harmonized = this.harmonizeStatuses(dataToUse);
    this.followUps.set(harmonized);
    this.saveToStorage(harmonized);
  }

  private harmonizeStatuses(list: FollowUp[]): FollowUp[] {
    const now = getAppCurrentDate();
    return list.map(f => {
      if (f.status === 'completed' || f.status === 'cancelled') {
        return f;
      }
      const appt = parseLocalDate(f.appointmentDate);
      if (appt.getTime() < now.getTime()) {
        return { ...f, status: 'overdue' as FollowUpStatus };
      }
      return f;
    });
  }

  private saveToStorage(data: FollowUp[]): void {
    this.storage.setItem(StorageService.KEYS.FOLLOW_UPS, data);
  }

  getFollowUps(): FollowUp[] {
    return this.followUps();
  }

  getFollowUpsByPatientId(patientId: string): FollowUp[] {
    return this.followUps().filter(f => f.patientId === patientId);
  }

  addFollowUp(data: Omit<FollowUp, 'id'>): FollowUp {
    const appt = parseLocalDate(data.appointmentDate);
    const now = getAppCurrentDate();
    let computedStatus: FollowUpStatus = data.status || 'upcoming';
    if (computedStatus !== 'completed' && computedStatus !== 'cancelled' && appt.getTime() < now.getTime()) {
      computedStatus = 'overdue';
    }

    const newFollowUp: FollowUp = {
      ...data,
      status: computedStatus,
      id: 'flw-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    };

    this.followUps.update(current => {
      const updated = [newFollowUp, ...current];
      this.saveToStorage(updated);
      return updated;
    });

    return newFollowUp;
  }

  updateFollowUp(id: string, updates: Partial<FollowUp>): FollowUp | undefined {
    let updatedFollowUp: FollowUp | undefined;

    this.followUps.update(current => {
      const updated = current.map(f => {
        if (f.id === id) {
          const merged = { ...f, ...updates };
          // Check if status should update
          if (merged.status !== 'completed' && merged.status !== 'cancelled') {
            const appt = parseLocalDate(merged.appointmentDate);
            if (appt.getTime() < Date.now()) {
              merged.status = 'overdue';
            } else if (merged.status === 'overdue') {
              merged.status = 'upcoming';
            }
          }
          updatedFollowUp = merged;
          return merged;
        }
        return f;
      });
      this.saveToStorage(updated);
      return updated;
    });

    return updatedFollowUp;
  }

  markCompleted(id: string): FollowUp | undefined {
    return this.updateFollowUp(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  }

  deleteFollowUp(id: string): boolean {
    let found = false;
    this.followUps.update(current => {
      const filtered = current.filter(f => {
        if (f.id === id) {
          found = true;
          return false;
        }
        return true;
      });
      if (found) {
        this.saveToStorage(filtered);
      }
      return filtered;
    });
    return found;
  }

  deleteByPatientId(patientId: string): void {
    this.followUps.update(current => {
      const filtered = current.filter(f => f.patientId !== patientId);
      this.saveToStorage(filtered);
      return filtered;
    });
  }

  resetToDefaults(): void {
    const initial = getInitialFollowUps();
    const harmonized = this.harmonizeStatuses(initial);
    this.followUps.set(harmonized);
    this.saveToStorage(harmonized);
  }
}
