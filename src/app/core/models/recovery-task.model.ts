export type TaskCategory = 'Vitals' | 'Physical Therapy' | 'Medication' | 'Wound Care' | 'Diet' | 'General';

export interface RecoveryTask {
  id: string;
  patientId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  completed: boolean;
  category: TaskCategory;
  completedDate?: string;
}
