/**
 * Date utilities for the booking flow.
 *
 * All slot times from the API are ISO 8601 with IST offset (+05:30).
 * The helpers here work with plain JS Date objects and YYYY-MM-DD strings
 * to avoid any third-party date library dependency.
 */

const WEEKDAY_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "Mon, 14 Jan" */
export function formatDateLabel(date: Date): string {
  return `${WEEKDAY_SHORT[date.getDay()]}, ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

/** "14" */
export function formatDayNumber(date: Date): string {
  return String(date.getDate());
}

/** "Mon" */
export function formatWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()];
}

/** "Jan" */
export function formatMonthShort(date: Date): string {
  return MONTH_SHORT[date.getMonth()];
}

/**
 * Convert a Date to the YYYY-MM-DD string expected by GET /slots?date=.
 * Uses local calendar date (not UTC) so the date the user sees matches
 * what the server receives.
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Return an array of `count` consecutive calendar dates starting from today.
 * Index 0 = today, index 1 = tomorrow, etc.
 */
export function getNextDays(count: number): Date[] {
  const dates: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Parse an ISO 8601 slot time string (e.g. "2024-01-15T09:00:00+05:30")
 * and return a human-readable "HH:MM AM/PM" label.
 */
export function formatSlotTime(isoString: string): string {
  // Parse only the time portion — split on 'T' then strip timezone offset
  const timePart = isoString.split("T")[1] ?? "";
  // "09:00:00+05:30" → "09:00:00"
  const hms = timePart.replace(/[+-]\d{2}:\d{2}$/, "").replace("Z", "");
  const [hStr = "0", mStr = "0"] = hms.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr.padStart(2, "0");
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${period}`;
}

/**
 * Given a slot's startsAt ISO string, return whether the slot is in the
 * morning session (before 12:00) or the evening session (12:00 and after).
 */
export function getSlotPeriod(startsAt: string): "morning" | "evening" {
  const timePart = startsAt.split("T")[1] ?? "";
  const hStr = timePart.split(":")[0] ?? "0";
  return parseInt(hStr, 10) < 12 ? "morning" : "evening";
}

/** True when two YYYY-MM-DD strings represent the same calendar date. */
export function isSameISODate(a: string, b: string): boolean {
  return a === b;
}

/** "Today", "Tomorrow", or the short weekday label */
export function formatRelativeDay(date: Date, today: Date): string {
  const dA = new Date(date);
  dA.setHours(0, 0, 0, 0);
  const dT = new Date(today);
  dT.setHours(0, 0, 0, 0);
  const diff = Math.round((dA.getTime() - dT.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return formatWeekdayShort(date);
}
