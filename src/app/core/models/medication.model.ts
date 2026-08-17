export type MedicationStatus = 'active' | 'completed' | 'discontinued';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  status: MedicationStatus;
  instructions?: string;
  prescribedBy?: string;
}
