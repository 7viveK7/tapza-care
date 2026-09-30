import type {
  BookingResponse,
  Doctor,
  LayoutConfig,
  Prescription,
  Slot,
} from "../types";
import { parseLayoutConfig } from "../core/config/schema";
import configFestival from "./data/config.festival.json";
import configNormal from "./data/config.normal.json";
import doctorsData from "./data/doctors.json";
import prescriptionsData from "./data/prescriptions.json";

const IST_OFFSET = "+05:30";

type SlotTemplate = {
  suffix: string;
  start: string;
  end: string;
};

const SLOT_TEMPLATES: SlotTemplate[] = [
  { suffix: "0900", start: "09:00:00", end: "09:30:00" },
  { suffix: "0930", start: "09:30:00", end: "10:00:00" },
  { suffix: "1000", start: "10:00:00", end: "10:30:00" },
  { suffix: "1030", start: "10:30:00", end: "11:00:00" },
  { suffix: "1100", start: "11:00:00", end: "11:30:00" },
  { suffix: "1700", start: "17:00:00", end: "17:30:00" },
  { suffix: "1730", start: "17:30:00", end: "18:00:00" },
  { suffix: "1800", start: "18:00:00", end: "18:30:00" },
];

function toIstIso(date: string, time: string): string {
  return `${date}T${time}${IST_OFFSET}`;
}

class MockDB {
  private doctors: Doctor[] = doctorsData as Doctor[];
  private prescriptions: Prescription[] = prescriptionsData as Prescription[];
  private bookedSlotIds = new Set<string>();
  private bookings: BookingResponse[] = [];

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  getPrescriptions(): Prescription[] {
    return this.prescriptions;
  }

  getBookings(): BookingResponse[] {
    return this.bookings;
  }

  getConfig(isFestival: boolean): LayoutConfig {
    return parseLayoutConfig(isFestival ? configFestival : configNormal);
  }

  getSlots(doctorId: string, date: string): Slot[] {
    return SLOT_TEMPLATES.map((template) => {
      const id = `${doctorId}-${date}-${template.suffix}`;
      return {
        id,
        doctorId,
        startsAt: toIstIso(date, template.start),
        endsAt: toIstIso(date, template.end),
        available: !this.bookedSlotIds.has(id),
      };
    });
  }

  bookSlot(doctorId: string, slotId: string): BookingResponse | null {
    if (this.bookedSlotIds.has(slotId)) {
      return null;
    }

    this.bookedSlotIds.add(slotId);
    const booking: BookingResponse = {
      id: `BK-${Date.now()}`,
      doctorId,
      slotId,
      bookedAt: new Date().toISOString(),
      status: "confirmed",
    };
    this.bookings.push(booking);
    return booking;
  }
}

export const db = new MockDB();
