import { TestBed } from '@angular/core/testing';
import { RecoveryTaskService } from './recovery-task.service';
import { StorageService } from './storage.service';
import { RecoveryTask } from '../models/recovery-task.model';
import { getOffsetISODate, getLocalISODate } from '../utils/date-utils';

describe('RecoveryTaskService', () => {
  let service: RecoveryTaskService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [RecoveryTaskService, StorageService]
    });
    service = TestBed.inject(RecoveryTaskService);
    storage = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and load initial seed data', () => {
    expect(service).toBeTruthy();
    expect(service.getTasks().length).toBeGreaterThan(0);
  });

  it('should get tasks for a specific patient', () => {
    const all = service.getTasks();
    const targetPatientId = all[0].patientId;
    const patientTasks = service.getTasksByPatientId(targetPatientId);

    expect(patientTasks.length).toBeGreaterThan(0);
    expect(patientTasks.every(t => t.patientId === targetPatientId)).toBeTrue();
  });

  it('should add a new recovery task', () => {
    const created = service.addTask({
      patientId: 'pat-1',
      title: 'Daily Quad Sets (3x10 reps)',
      category: 'Physical Therapy',
      dueDate: getOffsetISODate(2),
      completed: false,
      description: 'Strengthen quadriceps without bearing heavy weight'
    });

    expect(created.id).toBeDefined();
    expect(created.id.startsWith('tsk-')).toBeTrue();
    expect(created.completed).toBeFalse();
  });

  it('should toggle task completion state and set completedDate', () => {
    const all = service.getTasks();
    const target = all[0];
    const initialCompleted = target.completed;

    const toggled = service.toggleTaskCompletion(target.id);
    expect(toggled).toBeDefined();
    expect(toggled?.completed).toBe(!initialCompleted);

    if (toggled?.completed) {
      expect(toggled.completedDate).toBe(getLocalISODate());
    } else {
      expect(toggled?.completedDate).toBeUndefined();
    }
  });

  it('should update a task', () => {
    const all = service.getTasks();
    const target = all[0];

    const updated = service.updateTask(target.id, {
      title: 'Updated Task Title',
      category: 'Vitals'
    });

    expect(updated).toBeDefined();
    expect(updated?.title).toBe('Updated Task Title');
    expect(updated?.category).toBe('Vitals');
  });

  it('should delete a task by ID', () => {
    const all = service.getTasks();
    const target = all[0];
    const countBefore = all.length;

    const result = service.deleteTask(target.id);
    expect(result).toBeTrue();
    expect(service.getTasks().length).toBe(countBefore - 1);
  });

  it('should cascade delete tasks by patient ID', () => {
    const all = service.getTasks();
    const targetPatientId = all[0].patientId;

    service.deleteByPatientId(targetPatientId);
    const remaining = service.getTasksByPatientId(targetPatientId);
    expect(remaining.length).toBe(0);
  });
});
