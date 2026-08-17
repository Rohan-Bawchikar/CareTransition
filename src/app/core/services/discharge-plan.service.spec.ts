import { TestBed } from '@angular/core/testing';
import { DischargePlanService } from './discharge-plan.service';
import { StorageService } from './storage.service';
import { DischargePlan } from '../models/discharge-plan.model';

describe('DischargePlanService', () => {
  let service: DischargePlanService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [DischargePlanService, StorageService]
    });
    service = TestBed.inject(DischargePlanService);
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and load initial seed data', () => {
    expect(service).toBeTruthy();
    expect(service.getDischargePlans().length).toBeGreaterThan(0);
  });

  it('should get a plan by patient ID', () => {
    const all = service.getDischargePlans();
    const target = all[0];
    const plan = service.getPlanByPatientId(target.patientId);

    expect(plan).toBeDefined();
    expect(plan?.patientId).toBe(target.patientId);
  });

  it('should add and update a discharge plan', () => {
    const created = service.addDischargePlan({
      patientId: 'pat-custom',
      dischargeDate: '2026-08-12',
      summary: 'Patient stabilized following successful PCI.',
      careInstructions: 'Keep incision dry. Take all scheduled cardiac medications.',
      dietaryRestrictions: 'Low sodium, heart healthy',
      activityRestrictions: 'No heavy lifting > 10 lbs for 2 weeks',
      emergencyContact: '+91 99999 88888',
      redFlags: ['Chest pain', 'Shortness of breath']
    });

    expect(created.id).toBeDefined();

    const updated = service.updateDischargePlan(created.id, {
      summary: 'Updated clinical recovery summary.'
    });

    expect(updated?.summary).toBe('Updated clinical recovery summary.');
  });

  it('should cascade delete plans by patient ID', () => {
    const all = service.getDischargePlans();
    const targetPatientId = all[0].patientId;

    service.deleteByPatientId(targetPatientId);
    expect(service.getPlanByPatientId(targetPatientId)).toBeUndefined();
  });
});
