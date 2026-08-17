import { TestBed } from '@angular/core/testing';
import { MedicationService } from './medication.service';
import { StorageService } from './storage.service';
import { Medication } from '../models/medication.model';

describe('MedicationService', () => {
  let service: MedicationService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [MedicationService, StorageService]
    });
    service = TestBed.inject(MedicationService);
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and load initial seed data', () => {
    expect(service).toBeTruthy();
    expect(service.getMedications().length).toBeGreaterThan(0);
  });

  it('should get medications for a specific patient', () => {
    const all = service.getMedications();
    const targetPatientId = all[0].patientId;
    const patientMeds = service.getMedicationsByPatientId(targetPatientId);

    expect(patientMeds.length).toBeGreaterThan(0);
    expect(patientMeds.every(m => m.patientId === targetPatientId)).toBeTrue();
  });

  it('should add a new medication', () => {
    const created = service.addMedication({
      patientId: 'pat-1',
      name: 'Enoxaparin (Lovenox)',
      dosage: '40 mg / 0.4 mL',
      frequency: 'Once daily subcutaneously',
      startDate: '2026-08-10',
      endDate: '2026-08-24',
      status: 'active',
      instructions: 'Administer into deep subcutaneous tissue of abdomen'
    });

    expect(created.id).toBeDefined();
    expect(created.id.startsWith('med-')).toBeTrue();
    expect(created.name).toBe('Enoxaparin (Lovenox)');
  });

  it('should toggle medication status between active and completed', () => {
    const all = service.getMedications();
    const activeMed = all.find(m => m.status === 'active') || all[0];

    const toggled = service.toggleMedicationStatus(activeMed.id);
    expect(toggled).toBeDefined();
    expect(toggled?.status).toBe('completed');

    const toggledBack = service.toggleMedicationStatus(activeMed.id);
    expect(toggledBack?.status).toBe('active');
  });

  it('should update medication details', () => {
    const all = service.getMedications();
    const target = all[0];

    const updated = service.updateMedication(target.id, {
      dosage: '80 mg',
      instructions: 'Take after heavy meal'
    });

    expect(updated).toBeDefined();
    expect(updated?.dosage).toBe('80 mg');
    expect(updated?.instructions).toBe('Take after heavy meal');
  });

  it('should delete a medication by ID', () => {
    const all = service.getMedications();
    const target = all[0];
    const initialCount = all.length;

    const result = service.deleteMedication(target.id);
    expect(result).toBeTrue();
    expect(service.getMedications().length).toBe(initialCount - 1);
  });

  it('should cascade delete medications by patient ID', () => {
    const all = service.getMedications();
    const targetPatientId = all[0].patientId;

    service.deleteByPatientId(targetPatientId);
    const remaining = service.getMedicationsByPatientId(targetPatientId);
    expect(remaining.length).toBe(0);
  });
});
