export type Timing = "morning" | "afternoon" | "night";

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  days: number;
  timing: Timing[];
}

export interface Prescription {
  id: string;
  issuedAt: string;
  doctorName: string;
  clinicName: string;
  medicines: Medicine[];
}

export interface DoseRecord {
  prescriptionId: string;
  medicineId: string;
  date: string; // YYYY-MM-DD
  timing: Timing;
  taken: boolean;
}
