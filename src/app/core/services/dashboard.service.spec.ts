import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { PatientService } from './patient.service';
import { FollowUpService } from './follow-up.service';
import { RecoveryTaskService } from './recovery-task.service';
import { RiskAssessmentService } from './risk-assessment.service';
import { StorageService } from './storage.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let patientService: PatientService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        PatientService,
        FollowUpService,
        RecoveryTaskService,
        RiskAssessmentService,
        StorageService
      ]
    });
    service = TestBed.inject(DashboardService);
    patientService = TestBed.inject(PatientService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute total patients count and active patients count', () => {
    const total = service.totalPatientsCount();
    const active = service.activePatients().length;

    expect(total).toBeGreaterThan(0);
    expect(active).toBeLessThanOrEqual(total);
  });

  it('should compute cohort risk distribution counts', () => {
    const counts = service.riskCounts();
    const total = service.totalPatientsCount();

    expect(counts.high + counts.medium + counts.low).toBe(total);
  });

  it('should compute overall recovery adherence progress percentage between 0 and 100', () => {
    const progress = service.overallRecoveryProgress();
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('should compute recent discharges in last 7 days', () => {
    const recent = service.recentDischarges();
    expect(Array.isArray(recent)).toBeTrue();
  });

  it('should generate patient attention list sorted by risk score descending', () => {
    const attentionList = service.patientAttentionList();
    expect(attentionList.length).toBeGreaterThan(0);

    for (let i = 0; i < attentionList.length - 1; i++) {
      expect(attentionList[i].risk.score).toBeGreaterThanOrEqual(attentionList[i + 1].risk.score);
    }
  });
});
