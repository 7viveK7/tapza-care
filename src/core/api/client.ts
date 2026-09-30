import { db } from "../../mock/db";
import type { BookingPayload, BookingResponse } from "../../types";
import { devSettings } from "./devSettings";

const MOCK_ORIGIN = "https://mock.tapzacare.local";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class SlotConflictError extends ApiError {
  constructor(message = "Slot already taken by another patient") {
    super(409, message);
    this.name = "SlotConflictError";
  }
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function parseEndpoint(endpoint: string): URL {
  try {
    return new URL(endpoint, MOCK_ORIGIN);
  } catch {
    throw new ApiError(400, `Invalid endpoint: ${endpoint}`);
  }
}

function parseJsonBody(body: RequestInit["body"]): unknown {
  if (body == null) {
    return undefined;
  }
  if (typeof body === "string") {
    return JSON.parse(body) as unknown;
  }
  return body;
}

function isBookingPayload(value: unknown): value is BookingPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.doctorId === "string" &&
    record.doctorId.length > 0 &&
    typeof record.slotId === "string" &&
    record.slotId.length > 0
  );
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  if (devSettings.latencyMs > 0) {
    await delay(devSettings.latencyMs);
  }

  if (devSettings.forceFailure) {
    throw new ApiError(500, "Simulated Network Error: Service Unavailable (500)");
  }

  const url = parseEndpoint(endpoint);

  if (url.pathname === "/config" && method === "GET") {
    return db.getConfig(devSettings.isFestivalTheme) as T;
  }

  if (url.pathname === "/doctors" && method === "GET") {
    return db.getDoctors() as T;
  }

  if (url.pathname === "/slots" && method === "GET") {
    const doctorId = url.searchParams.get("doctorId");
    const date = url.searchParams.get("date");
    if (!doctorId || !date) {
      throw new ApiError(400, "GET /slots requires doctorId and date query params");
    }
    return db.getSlots(doctorId, date) as T;
  }

  if (url.pathname === "/bookings" && method === "POST") {
    const payload = parseJsonBody(options.body);
    if (!isBookingPayload(payload)) {
      throw new ApiError(400, "POST /bookings requires doctorId and slotId");
    }

    const booking: BookingResponse | null = db.bookSlot(
      payload.doctorId,
      payload.slotId,
    );
    if (!booking) {
      throw new SlotConflictError();
    }
    return booking as T;
  }

  if (url.pathname === "/prescriptions" && method === "GET") {
    return db.getPrescriptions() as T;
  }

  throw new ApiError(404, `Endpoint ${method} ${url.pathname} not found on mock engine`);
}
