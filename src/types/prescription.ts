export type Timing = "morning" | "afternoon" | "night";

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  days: number;
  timing: Timing[];
  instructions?: string;
}

export interface Prescription {
  id: string;
  issuedAt: string;
  doctorName: string;
  clinicName: string;
  patientName: string;
  diagnosis: string;
  medicines: Medicine[];
  notes?: string;
}

export interface DoseRecord {
  prescriptionId: string;
  medicineId: string;
  date: string;
  timing: Timing;
  taken: boolean;
}
