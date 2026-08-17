export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskSummary {
  level: RiskLevel;
  score: number; // 0 to 100
  reason: string;
  overdueFollowUps: number;
  overdueTasks: number;
  incompleteTasks: number;
  totalTasks: number;
  completionPercentage: number;
  factors: string[];
}
