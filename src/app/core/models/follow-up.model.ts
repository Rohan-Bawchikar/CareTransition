export type FollowUpStatus = 'upcoming' | 'completed' | 'overdue' | 'cancelled';

export interface FollowUp {
  id: string;
  patientId: string;
  title: string;
  appointmentDate: string; // ISO date string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  department: string;
  doctorName: string;
  status: FollowUpStatus;
  notes?: string;
  location?: string;
  completedAt?: string;
}
