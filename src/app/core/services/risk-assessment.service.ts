import { Injectable } from '@angular/core';
import { FollowUp } from '../models/follow-up.model';
import { RecoveryTask } from '../models/recovery-task.model';
import { RiskLevel, RiskSummary } from '../models/risk-summary.model';
import { parseLocalDate } from '../utils/date-utils';

/**
 * RiskAssessmentService
 * 
 * Provides transparent, rule-based clinical risk stratification for post-discharge patients.
 * 
 * Rules:
 * 1. HIGH RISK:
 *    - 1 or more overdue follow-up appointments, OR
 *    - 2 or more overdue incomplete recovery tasks, OR
 *    - Recovery task completion < 35% when discharge was > 4 days ago.
 * 
 * 2. MEDIUM RISK:
 *    - Follow-up appointment scheduled within the next 48 hours (pending clinical review), OR
 *    - 1 overdue incomplete recovery task, OR
 *    - 1 or more pending incomplete tasks with completion rate between 35% and 75%.
 * 
 * 3. LOW RISK:
 *    - 0 overdue appointments and 0 overdue tasks, AND
 *    - Recovery task completion >= 75% (or all assigned tasks completed).
 */
@Injectable({
  providedIn: 'root'
})
export class RiskAssessmentService {

  calculateRisk(
    patientFollowUps: FollowUp[],
    patientTasks: RecoveryTask[],
    dischargeDateStr?: string
  ): RiskSummary {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Analyze Follow-Ups
    let overdueFollowUpsCount = 0;
    let upcomingWithin48hCount = 0;

    for (const f of patientFollowUps) {
      if (f.status === 'completed' || f.status === 'cancelled') {
        continue;
      }

      const apptDate = parseLocalDate(f.appointmentDate);
      const isPast = apptDate.getTime() < today.getTime();

      if (f.status === 'overdue' || isPast) {
        overdueFollowUpsCount++;
      } else {
        // Check if within next 48 hours
        const diffHours = (apptDate.getTime() - today.getTime()) / (1000 * 60 * 60);
        if (diffHours >= 0 && diffHours <= 48) {
          upcomingWithin48hCount++;
        }
      }
    }

    // 2. Analyze Recovery Tasks
    const totalTasks = patientTasks.length;
    let completedTasksCount = 0;
    let overdueTasksCount = 0;
    let incompleteTasksCount = 0;

    for (const t of patientTasks) {
      if (t.completed) {
        completedTasksCount++;
      } else {
        incompleteTasksCount++;
        const dueDate = parseLocalDate(t.dueDate);
        if (dueDate.getTime() < today.getTime()) {
          overdueTasksCount++;
        }
      }
    }

    const completionPercentage = totalTasks > 0 
      ? Math.round((completedTasksCount / totalTasks) * 100) 
      : 100;

    // 3. Days since discharge
    let daysSinceDischarge = 0;
    if (dischargeDateStr) {
      const dDate = parseLocalDate(dischargeDateStr);
      daysSinceDischarge = Math.max(0, Math.floor((today.getTime() - dDate.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // 4. Rule-Based Evaluation & Factor Construction
    const factors: string[] = [];
    let level: RiskLevel = 'LOW';
    let reason = 'All scheduled follow-ups and recovery activities are on track.';
    let score = 20; // baseline low risk score

    // High Risk Rules
    if (overdueFollowUpsCount > 0) {
      level = 'HIGH';
      score = 85 + Math.min(15, overdueFollowUpsCount * 5);
      factors.push(`${overdueFollowUpsCount} follow-up appointment${overdueFollowUpsCount > 1 ? 's are' : ' is'} overdue.`);
      reason = `${overdueFollowUpsCount} follow-up appointment${overdueFollowUpsCount > 1 ? 's are' : ' is'} overdue.`;
    } else if (overdueTasksCount >= 2) {
      level = 'HIGH';
      score = 80;
      factors.push(`${overdueTasksCount} recovery tasks are overdue.`);
      reason = `${overdueTasksCount} recovery tasks are overdue.`;
    } else if (daysSinceDischarge >= 4 && totalTasks > 0 && completionPercentage < 35) {
      level = 'HIGH';
      score = 75;
      factors.push(`Low recovery task adherence (${completionPercentage}%) after ${daysSinceDischarge} days post-discharge.`);
      reason = `Adherence is low (${completionPercentage}%) for post-discharge tasks.`;
    } 
    // Medium Risk Rules
    else if (overdueTasksCount === 1) {
      level = 'MEDIUM';
      score = 60;
      factors.push('1 recovery task is past its due date.');
      reason = '1 recovery task is overdue.';
    } else if (upcomingWithin48hCount > 0) {
      level = 'MEDIUM';
      score = 50;
      factors.push(`Follow-up appointment scheduled within the next 48 hours.`);
      reason = 'Upcoming clinical follow-up pending within 48 hours.';
    } else if (incompleteTasksCount > 0 && completionPercentage < 75) {
      level = 'MEDIUM';
      score = 45;
      factors.push(`${incompleteTasksCount} recovery task${incompleteTasksCount > 1 ? 's are' : ' is'} incomplete (${completionPercentage}% finished).`);
      reason = `${incompleteTasksCount} recovery task${incompleteTasksCount > 1 ? 's are' : ' is'} incomplete.`;
    } else {
      // Low Risk
      level = 'LOW';
      score = Math.max(10, 100 - completionPercentage);
      factors.push(`Recovery checklist is ${completionPercentage}% completed with no overdue obligations.`);
      reason = 'All scheduled follow-ups and recovery activities are on track.';
    }

    return {
      level,
      score,
      reason,
      overdueFollowUps: overdueFollowUpsCount,
      overdueTasks: overdueTasksCount,
      incompleteTasks: incompleteTasksCount,
      totalTasks,
      completionPercentage,
      factors
    };
  }
}
