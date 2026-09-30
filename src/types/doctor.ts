export type ClinicCity = "Hyderabad" | "Vijayawada";

export type SpokenLanguage = "English" | "Hindi" | "Telugu" | "Urdu" | "Tamil";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  feeInr: number;
  languages: SpokenLanguage[];
  clinicName: string;
  city: ClinicCity;
  experienceYears: number;
  rating: number;
}
