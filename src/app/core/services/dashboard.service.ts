import { Injectable, computed, inject } from '@angular/core';
import { PatientService } from './patient.service';
import { FollowUpService } from './follow-up.service';
import { RecoveryTaskService } from './recovery-task.service';
import { RiskAssessmentService } from './risk-assessment.service';
import { Patient } from '../models/patient.model';
import { FollowUp } from '../models/follow-up.model';
import { RiskSummary } from '../models/risk-summary.model';
import { getAppCurrentDate, getLocalISODate, parseLocalDate } from '../utils/date-utils';

export interface PatientAttentionItem {
  patient: Patient;
  risk: RiskSummary;
  overdueFollowUps: FollowUp[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private patientService = inject(PatientService);
  private followUpService = inject(FollowUpService);
  private taskService = inject(RecoveryTaskService);
  private riskService = inject(RiskAssessmentService);

  // Computed: Total active patients
  readonly activePatients = computed(() => {
    return this.patientService.patients().filter(p => p.status !== 'completed');
  });

  readonly totalPatientsCount = computed(() => {
    return this.patientService.patients().length;
  });

  // Computed: Discharged in last 7 days
  readonly recentDischarges = computed(() => {
    const today = getAppCurrentDate();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = getAppCurrentDate();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return this.patientService.patients()
      .filter(p => {
        const d = parseLocalDate(p.dischargeDate);
        return d >= sevenDaysAgo && d <= today;
      })
      .sort((a, b) => parseLocalDate(b.dischargeDate).getTime() - parseLocalDate(a.dischargeDate).getTime());
  });

  // Computed: Follow-ups Today
  readonly todayFollowUps = computed(() => {
    const todayStr = getLocalISODate();
    return this.followUpService.followUps().filter(f => {
      return f.appointmentDate.startsWith(todayStr);
    });
  });

  // Computed: Pending Follow-ups (Upcoming + Today)
  readonly pendingFollowUps = computed(() => {
    return this.followUpService.followUps().filter(f => f.status === 'upcoming');
  });

  // Computed: Overdue Follow-ups
  readonly overdueFollowUps = computed(() => {
    return this.followUpService.followUps().filter(f => f.status === 'overdue');
  });

  // Computed: Patient Risk map and Attention-needed list
  readonly patientAttentionList = computed<PatientAttentionItem[]>(() => {
    const patients = this.patientService.patients();
    const followUps = this.followUpService.followUps();
    const tasks = this.taskService.tasks();

    const items: PatientAttentionItem[] = [];

    for (const patient of patients) {
      const pFollowUps = followUps.filter(f => f.patientId === patient.id);
      const pTasks = tasks.filter(t => t.patientId === patient.id);
      const risk = this.riskService.calculateRisk(pFollowUps, pTasks, patient.dischargeDate);

      const overdue = pFollowUps.filter(f => f.status === 'overdue');

      if (risk.level === 'HIGH' || risk.level === 'MEDIUM' || patient.status === 'attention_needed') {
        items.push({
          patient,
          risk,
          overdueFollowUps: overdue
        });
      }
    }

    // Sort: HIGH risk first, then by score descending
    return items.sort((a, b) => b.risk.score - a.risk.score);
  });

  // Computed: Risk level breakdown counts
  readonly riskCounts = computed(() => {
    const patients = this.patientService.patients();
    const followUps = this.followUpService.followUps();
    const tasks = this.taskService.tasks();

    let high = 0;
    let medium = 0;
    let low = 0;

    for (const patient of patients) {
      const pFollowUps = followUps.filter(f => f.patientId === patient.id);
      const pTasks = tasks.filter(t => t.patientId === patient.id);
      const risk = this.riskService.calculateRisk(pFollowUps, pTasks, patient.dischargeDate);

      if (risk.level === 'HIGH') high++;
      else if (risk.level === 'MEDIUM') medium++;
      else low++;
    }

    return { high, medium, low, total: patients.length };
  });

  // Computed: System-wide overall recovery task completion percentage
  readonly overallRecoveryProgress = computed(() => {
    const tasks = this.taskService.tasks();
    if (tasks.length === 0) return 100;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  });
}
