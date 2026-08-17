export interface DischargePlan {
  id: string;
  patientId: string;
  dischargeDate: string;
  summary: string;
  careInstructions: string;
  dietaryRestrictions?: string;
  activityRestrictions?: string;
  caregiverName?: string;
  caregiverPhone?: string;
  emergencyContact?: string;
  redFlags?: string[];
  notes?: string;
}
