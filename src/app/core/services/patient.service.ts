import { Injectable, signal, inject } from '@angular/core';
import { Patient } from '../models/patient.model';
import { StorageService } from './storage.service';
import { getInitialPatients } from '../data/seed-data';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private storage = inject(StorageService);

  // Reactive Signal holding all patients
  readonly patients = signal<Patient[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (!this.storage.isInitialized()) {
      const initial = getInitialPatients();
      this.patients.set(initial);
      this.saveToStorage(initial);
      return;
    }
    const saved = this.storage.getItem<Patient[]>(StorageService.KEYS.PATIENTS, []);
    if (saved && saved.length > 0) {
      this.patients.set(saved);
    } else {
      const initial = getInitialPatients();
      this.patients.set(initial);
      this.saveToStorage(initial);
    }
  }

  private saveToStorage(data: Patient[]): void {
    this.storage.setItem(StorageService.KEYS.PATIENTS, data);
  }

  getPatients(): Patient[] {
    return this.patients();
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients().find(p => p.id === id);
  }

  addPatient(patientData: Omit<Patient, 'id'>): Patient {
    const newPatient: Patient = {
      ...patientData,
      id: 'pat-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    };

    this.patients.update(current => {
      const updated = [newPatient, ...current];
      this.saveToStorage(updated);
      return updated;
    });

    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
    let updatedPatient: Patient | undefined;

    this.patients.update(current => {
      const updated = current.map(p => {
        if (p.id === id) {
          updatedPatient = { ...p, ...updates };
          return updatedPatient;
        }
        return p;
      });
      this.saveToStorage(updated);
      return updated;
    });

    return updatedPatient;
  }

  deletePatient(id: string): boolean {
    let found = false;
    this.patients.update(current => {
      const filtered = current.filter(p => {
        if (p.id === id) {
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

  resetToDefaults(): void {
    const initial = getInitialPatients();
    this.patients.set(initial);
    this.saveToStorage(initial);
  }
}
