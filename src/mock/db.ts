import { Doctor, Prescription, Slot } from "../types";
import configFestival from "./data/config.festival.json";
import configNormal from "./data/config.normal.json";
import doctorsData from "./data/doctors.json";
import prescriptionsData from "./data/prescriptions.json";

class MockDB {
  private doctors: Doctor[] = doctorsData;
  private prescriptions: Prescription[] = prescriptionsData;
  private bookedSlotIds: Set<string> = new Set();

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  getPrescriptions(): Prescription[] {
    return this.prescriptions;
  }

  getConfig(isFestival: boolean) {
    return isFestival ? configFestival : configNormal;
  }

  getSlots(doctorId: string, date: string): Slot[] {
    // Generate standard morning/evening slots for the doctor
    const times = [
      { id: `${doctorId}-${date}-0900`, start: "09:00 AM", end: "09:30 AM" },
      { id: `${doctorId}-${date}-1000`, start: "10:00 AM", end: "10:30 AM" },
      { id: `${doctorId}-${date}-1100`, start: "11:00 AM", end: "11:30 AM" },
      { id: `${doctorId}-${date}-1700`, start: "05:00 PM", end: "05:30 PM" },
      { id: `${doctorId}-${date}-1800`, start: "06:00 PM", end: "06:30 PM" },
    ];

    return times.map((t) => ({
      id: t.id,
      doctorId,
      startsAt: `${date} ${t.start}`,
      endsAt: `${date} ${t.end}`,
      available: !this.bookedSlotIds.has(t.id),
    }));
  }

  bookSlot(doctorId: string, slotId: string): boolean {
    if (this.bookedSlotIds.has(slotId)) {
      return false; // 409 Conflict trigger[cite: 1]
    }
    this.bookedSlotIds.add(slotId);
    return true;
  }
}

export const db = new MockDB();
