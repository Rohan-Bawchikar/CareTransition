export type PatientStatus = 'active' | 'completed' | 'attention_needed';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  contactNumber: string;
  emergencyContact?: string;
  dischargeDate: string; // ISO date string YYYY-MM-DD
  admissionDate?: string;
  primaryCondition: string;
  assignedDoctor: string;
  department?: string;
  status: PatientStatus;
  notes?: string;
}
