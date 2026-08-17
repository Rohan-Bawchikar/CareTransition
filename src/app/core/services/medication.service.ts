import { Injectable, signal, inject } from '@angular/core';
import { Medication, MedicationStatus } from '../models/medication.model';
import { StorageService } from './storage.service';
import { getInitialMedications } from '../data/seed-data';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  private storage = inject(StorageService);

  readonly medications = signal<Medication[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (!this.storage.isInitialized()) {
      const initial = getInitialMedications();
      this.medications.set(initial);
      this.saveToStorage(initial);
      return;
    }
    const saved = this.storage.getItem<Medication[]>(StorageService.KEYS.MEDICATIONS, []);
    if (saved && saved.length > 0) {
      this.medications.set(saved);
    } else {
      const initial = getInitialMedications();
      this.medications.set(initial);
      this.saveToStorage(initial);
    }
  }

  private saveToStorage(data: Medication[]): void {
    this.storage.setItem(StorageService.KEYS.MEDICATIONS, data);
  }

  getMedications(): Medication[] {
    return this.medications();
  }

  getMedicationsByPatientId(patientId: string): Medication[] {
    return this.medications().filter(m => m.patientId === patientId);
  }

  addMedication(medData: Omit<Medication, 'id'>): Medication {
    const newMed: Medication = {
      ...medData,
      id: 'med-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    };

    this.medications.update(current => {
      const updated = [newMed, ...current];
      this.saveToStorage(updated);
      return updated;
    });

    return newMed;
  }

  updateMedication(id: string, updates: Partial<Medication>): Medication | undefined {
    let updatedMed: Medication | undefined;

    this.medications.update(current => {
      const updated = current.map(m => {
        if (m.id === id) {
          updatedMed = { ...m, ...updates };
          return updatedMed;
        }
        return m;
      });
      this.saveToStorage(updated);
      return updated;
    });

    return updatedMed;
  }

  toggleMedicationStatus(id: string): Medication | undefined {
    const med = this.medications().find(m => m.id === id);
    if (!med) return undefined;
    const newStatus: MedicationStatus = med.status === 'active' ? 'completed' : 'active';
    return this.updateMedication(id, { status: newStatus });
  }

  deleteMedication(id: string): boolean {
    let found = false;
    this.medications.update(current => {
      const filtered = current.filter(m => {
        if (m.id === id) {
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
    this.medications.update(current => {
      const filtered = current.filter(m => m.patientId !== patientId);
      this.saveToStorage(filtered);
      return filtered;
    });
  }

  resetToDefaults(): void {
    const initial = getInitialMedications();
    this.medications.set(initial);
    this.saveToStorage(initial);
  }
}
