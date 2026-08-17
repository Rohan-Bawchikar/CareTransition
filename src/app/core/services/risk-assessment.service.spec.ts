import { TestBed } from '@angular/core/testing';
import { RiskAssessmentService } from './risk-assessment.service';
import { FollowUp } from '../models/follow-up.model';
import { RecoveryTask } from '../models/recovery-task.model';
import { getOffsetISODate, getOffsetISODateTime, getLocalISODate } from '../utils/date-utils';

describe('RiskAssessmentService', () => {
  let service: RiskAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RiskAssessmentService]
    });
    service = TestBed.inject(RiskAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Scenario 1: High Risk due to Overdue Follow-Up Appointment', () => {
    it('should assign High risk and score >= 85 when a patient has an overdue follow-up', () => {
      const followUps: FollowUp[] = [
        {
          id: 'flw-1',
          patientId: 'pat-1',
          title: 'Post-op Wound Check',
          appointmentDate: getOffsetISODateTime(-2, 10, 0),
          department: 'Surgery',
          doctorName: 'Dr. Sterling',
          status: 'overdue'
        }
      ];

      const tasks: RecoveryTask[] = [
        {
          id: 'task-1',
          patientId: 'pat-1',
          title: 'Vitals check',
          category: 'Vitals',
          dueDate: getOffsetISODate(1),
          completed: true,
          description: 'Measure temperature and BP'
        }
      ];

      const dischargeDate = getOffsetISODate(-3);
      const result = service.calculateRisk(followUps, tasks, dischargeDate);

      expect(result.level).toBe('HIGH');
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.reason.toLowerCase()).toContain('overdue');
      expect(result.overdueFollowUps).toBe(1);
    });
  });

  describe('Scenario 2: High Risk due to Multiple Overdue Recovery Tasks or Poor Adherence', () => {
    it('should assign High risk when patient has 2 or more overdue recovery tasks', () => {
      const followUps: FollowUp[] = [
        {
          id: 'flw-2',
          patientId: 'pat-2',
          title: 'Routine checkup',
          appointmentDate: getOffsetISODateTime(5, 10, 0),
          department: 'Cardiology',
          doctorName: 'Dr. Vance',
          status: 'upcoming'
        }
      ];

      const tasks: RecoveryTask[] = [
        {
          id: 'task-1',
          patientId: 'pat-2',
          title: 'Task 1',
          category: 'Physical Therapy',
          dueDate: getOffsetISODate(-2),
          completed: false,
          description: 'Mobility protocol'
        },
        {
          id: 'task-2',
          patientId: 'pat-2',
          title: 'Task 2',
          category: 'Vitals',
          dueDate: getOffsetISODate(-1),
          completed: false,
          description: 'Vitals protocol'
        }
      ];

      const dischargeDate = getOffsetISODate(-3);
      const result = service.calculateRisk(followUps, tasks, dischargeDate);

      expect(result.level).toBe('HIGH');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.overdueTasks).toBe(2);
    });

    it('should assign High risk when patient is >= 4 days post discharge and task completion is < 35%', () => {
      const followUps: FollowUp[] = [];
      const tasks: RecoveryTask[] = [
        {
          id: 'task-1',
          patientId: 'pat-2',
          title: 'Task 1',
          category: 'Physical Therapy',
          dueDate: getOffsetISODate(2),
          completed: false,
          description: 'PT 1'
        },
        {
          id: 'task-2',
          patientId: 'pat-2',
          title: 'Task 2',
          category: 'Vitals',
          dueDate: getOffsetISODate(3),
          completed: false,
          description: 'Vitals 1'
        },
        {
          id: 'task-3',
          patientId: 'pat-2',
          title: 'Task 3',
          category: 'Diet',
          dueDate: getOffsetISODate(4),
          completed: false,
          description: 'Diet 1'
        },
        {
          id: 'task-4',
          patientId: 'pat-2',
          title: 'Task 4',
          category: 'General',
          dueDate: getOffsetISODate(5),
          completed: true,
          description: 'General 1'
        }
      ];

      // 5 days post discharge, 1/4 = 25% (< 35%)
      const dischargeDate = getOffsetISODate(-5);
      const result = service.calculateRisk(followUps, tasks, dischargeDate);

      expect(result.level).toBe('HIGH');
      expect(result.reason.toLowerCase()).toContain('adherence');
    });
  });

  describe('Scenario 3: Medium Risk due to 1 Overdue Task or Upcoming Follow-up Window', () => {
    it('should assign Medium risk when patient has 1 overdue task', () => {
      const followUps: FollowUp[] = [
        {
          id: 'flw-3',
          patientId: 'pat-3',
          title: 'Clinic consult',
          appointmentDate: getOffsetISODateTime(10, 14, 0),
          department: 'Endocrinology',
          doctorName: 'Dr. Patel',
          status: 'upcoming'
        }
      ];

      const tasks: RecoveryTask[] = [
        {
          id: 'task-1',
          patientId: 'pat-3',
          title: 'Log weight',
          category: 'Vitals',
          dueDate: getOffsetISODate(-1),
          completed: false,
          description: 'Daily weight check'
        },
        {
          id: 'task-2',
          patientId: 'pat-3',
          title: 'Walking',
          category: 'Physical Therapy',
          dueDate: getOffsetISODate(1),
          completed: true,
          description: '15 min gentle walking'
        }
      ];

      const dischargeDate = getOffsetISODate(-2);
      const result = service.calculateRisk(followUps, tasks, dischargeDate);

      expect(result.level).toBe('MEDIUM');
      expect(result.overdueTasks).toBe(1);
    });

    it('should assign Medium risk when upcoming follow-up appointment is within 48 hours', () => {
      const followUps: FollowUp[] = [
        {
          id: 'flw-4',
          patientId: 'pat-4',
          title: '2-Day Wound Check',
          appointmentDate: getOffsetISODateTime(1, 9, 30), // tomorrow (within 48h)
          department: 'Surgery',
          doctorName: 'Dr. Sterling',
          status: 'upcoming'
        }
      ];

      const tasks: RecoveryTask[] = [
        {
          id: 'task-1',
          patientId: 'pat-4',
          title: 'Breathing exercise',
          category: 'Physical Therapy',
          dueDate: getOffsetISODate(1),
          completed: true,
          description: 'Spirometer exercise'
        }
      ];

      const dischargeDate = getOffsetISODate(-1);
      const result = service.calculateRisk(followUps, tasks, dischargeDate);

      expect(result.level).toBe('MEDIUM');
      expect(result.reason.toLowerCase()).toContain('upcoming');
    });
  });

  describe('Scenario 4: Low Risk with On-Track Recovery Protocols', () => {
    it('should assign Low risk when 0 overdue follow-ups, 0 overdue tasks, and high adherence', () => {
      const followUps: FollowUp[] = [
        {
          id: 'flw-5',
          patientId: 'pat-5',
          title: 'Monthly Review',
          appointmentDate: getOffsetISODateTime(14, 11, 0),
          department: 'General Medicine',
          doctorName: 'Dr. Nair',
          status: 'upcoming'
        }
      ];

      const tasks: RecoveryTask[] = [
        {
          id: 'task-1',
          patientId: 'pat-5',
          title: 'Exercise 1',
          category: 'Physical Therapy',
          dueDate: getOffsetISODate(2),
          completed: true,
          description: 'Leg lifts'
        },
        {
          id: 'task-2',
          patientId: 'pat-5',
          title: 'Diet log',
          category: 'Diet',
          dueDate: getOffsetISODate(3),
          completed: true,
          description: 'Record meals'
        },
        {
          id: 'task-3',
          patientId: 'pat-5',
          title: 'Vitals check',
          category: 'Vitals',
          dueDate: getOffsetISODate(4),
          completed: true,
          description: 'Record temperature'
        },
        {
          id: 'task-4',
          patientId: 'pat-5',
          title: 'Wound clean',
          category: 'Wound Care',
          dueDate: getOffsetISODate(5),
          completed: false,
          description: 'Clean area'
        }
      ];

      // 3/4 completed = 75%
      const dischargeDate = getOffsetISODate(-2);
      const result = service.calculateRisk(followUps, tasks, dischargeDate);

      expect(result.level).toBe('LOW');
      expect(result.score).toBeLessThan(40);
      expect(result.overdueFollowUps).toBe(0);
      expect(result.overdueTasks).toBe(0);
    });

    it('should assign Low risk with score 10 when 100% adherence is achieved', () => {
      const followUps: FollowUp[] = [];
      const tasks: RecoveryTask[] = [
        {
          id: 'task-1',
          patientId: 'pat-6',
          title: 'Full recovery protocol',
          category: 'General',
          dueDate: getOffsetISODate(1),
          completed: true,
          description: 'All goals done'
        }
      ];

      const result = service.calculateRisk(followUps, tasks, getOffsetISODate(-1));
      expect(result.level).toBe('LOW');
      expect(result.score).toBe(10);
      expect(result.completionPercentage).toBe(100);
    });
  });
});
