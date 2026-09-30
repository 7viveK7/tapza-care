export interface Slot {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
}

export interface BookingPayload {
  doctorId: string;
  slotId: string;
}

export type BookingStatus = "confirmed" | "failed";

export interface BookingResponse {
  id: string;
  doctorId: string;
  slotId: string;
  bookedAt: string;
  status: BookingStatus;
}

export type Booking = BookingResponse;
