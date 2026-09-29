export interface Slot {
  id: string;
  doctorId: string;
  startsAt: string; // ISO date or time string
  endsAt: string;
  available: boolean;
}

export interface BookingPayload {
  doctorId: string;
  slotId: string;
}

export interface BookingResponse {
  id: string;
  doctorId: string;
  slotId: string;
  bookedAt: string;
  status: "confirmed" | "failed";
}
