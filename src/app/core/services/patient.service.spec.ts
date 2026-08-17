import { TestBed } from '@angular/core/testing';
import { PatientService } from './patient.service';
import { StorageService } from './storage.service';
import { Patient } from '../models/patient.model';

describe('PatientService', () => {
  let service: PatientService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [PatientService, StorageService]
    });
    service = TestBed.inject(PatientService);
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and load initial seed data', () => {
    expect(service).toBeTruthy();
    const patients = service.getPatients();
    expect(patients.length).toBeGreaterThan(0);
  });

  it('should get a patient by ID', () => {
    const all = service.getPatients();
    const target = all[0];
    const found = service.getPatientById(target.id);
    expect(found).toBeDefined();
    expect(found?.fullName).toBe(target.fullName);
  });

  it('should add a new patient with generated id', () => {
    const initialCount = service.getPatients().length;
    const newPatData: Omit<Patient, 'id'> = {
      fullName: 'Test Patient Alpha',
      age: 48,
      gender: 'Male',
      contactNumber: '+91 99999 11111',
      emergencyContact: '+91 88888 22222',
      primaryCondition: 'Total Knee Replacement',
      department: 'Orthopedics',
      assignedDoctor: 'Dr. Arthur Sterling',
      dischargeDate: '2026-08-10',
      status: 'active',
      notes: 'Initial clinical notes'
    };

    const created = service.addPatient(newPatData);
    expect(created.id).toBeDefined();
    expect(created.id.startsWith('pat-')).toBeTrue();
    expect(service.getPatients().length).toBe(initialCount + 1);

    const persisted = storage.getItem<Patient[]>(StorageService.KEYS.PATIENTS, []);
    expect(persisted?.some(p => p.id === created.id)).toBeTrue();
  });

  it('should update an existing patient', () => {
    const all = service.getPatients();
    const target = all[0];

    const updated = service.updatePatient(target.id, {
      fullName: 'Updated Patient Name',
      status: 'completed'
    });

    expect(updated).toBeDefined();
    expect(updated?.fullName).toBe('Updated Patient Name');
    expect(updated?.status).toBe('completed');

    const refetched = service.getPatientById(target.id);
    expect(refetched?.fullName).toBe('Updated Patient Name');
  });

  it('should delete a patient by ID', () => {
    const all = service.getPatients();
    const target = all[0];
    const initialCount = all.length;

    const result = service.deletePatient(target.id);
    expect(result).toBeTrue();
    expect(service.getPatients().length).toBe(initialCount - 1);
    expect(service.getPatientById(target.id)).toBeUndefined();
  });

  it('should reset to default data', () => {
    service.addPatient({
      fullName: 'Temporary Patient',
      age: 30,
      gender: 'Female',
      contactNumber: '+91 91234 56789',
      primaryCondition: 'Appendectomy',
      department: 'General Surgery',
      assignedDoctor: 'Dr. Test',
      dischargeDate: '2026-08-12',
      status: 'active'
    });

    service.resetToDefaults();
    const patients = service.getPatients();
    expect(patients.some(p => p.fullName === 'Temporary Patient')).toBeFalse();
  });
});
