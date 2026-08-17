import { TestBed } from '@angular/core/testing';
import { FollowUpService } from './follow-up.service';
import { StorageService } from './storage.service';
import { FollowUp } from '../models/follow-up.model';
import { getOffsetISODateTime, parseLocalDate } from '../utils/date-utils';

describe('FollowUpService', () => {
  let service: FollowUpService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [FollowUpService, StorageService]
    });
    service = TestBed.inject(FollowUpService);
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and load initial seed data', () => {
    expect(service).toBeTruthy();
    expect(service.getFollowUps().length).toBeGreaterThan(0);
  });

  it('should filter follow-ups by patient ID', () => {
    const all = service.getFollowUps();
    const targetPatientId = all[0].patientId;
    const patientFollowUps = service.getFollowUpsByPatientId(targetPatientId);

    expect(patientFollowUps.length).toBeGreaterThan(0);
    expect(patientFollowUps.every(f => f.patientId === targetPatientId)).toBeTrue();
  });

  it('should add a new follow-up with computed status', () => {
    const futureDate = getOffsetISODateTime(5, 14, 0);
    const created = service.addFollowUp({
      patientId: 'pat-1',
      title: '3-Week Wound Review',
      appointmentDate: futureDate,
      department: 'Orthopedics',
      doctorName: 'Dr. Arthur Sterling',
      status: 'upcoming'
    });

    expect(created.id).toBeDefined();
    expect(created.id.startsWith('flw-')).toBeTrue();
    expect(created.status).toBe('upcoming');
  });

  it('should mark a follow-up as completed', () => {
    const all = service.getFollowUps();
    const target = all.find(f => f.status !== 'completed') || all[0];

    const completed = service.markCompleted(target.id);
    expect(completed).toBeDefined();
    expect(completed?.status).toBe('completed');
  });

  it('should update follow-up details', () => {
    const all = service.getFollowUps();
    const target = all[0];

    const updated = service.updateFollowUp(target.id, {
      location: 'New Clinic Suite 500',
      notes: 'Updated preparation instructions'
    });

    expect(updated).toBeDefined();
    expect(updated?.location).toBe('New Clinic Suite 500');
    expect(updated?.notes).toBe('Updated preparation instructions');
  });

  it('should delete follow-up by ID', () => {
    const all = service.getFollowUps();
    const target = all[0];
    const initialCount = all.length;

    const result = service.deleteFollowUp(target.id);
    expect(result).toBeTrue();
    expect(service.getFollowUps().length).toBe(initialCount - 1);
  });

  it('should cascade delete follow-ups by patient ID', () => {
    const all = service.getFollowUps();
    const targetPatientId = all[0].patientId;

    service.deleteByPatientId(targetPatientId);
    const remaining = service.getFollowUpsByPatientId(targetPatientId);
    expect(remaining.length).toBe(0);
  });
});
