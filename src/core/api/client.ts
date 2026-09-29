import { db } from "../../mock/db";
import { devSettings } from "./devSettings";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { method = "GET", body } = options;

  // 1. Simulate Latency[cite: 1]
  if (devSettings.latencyMs > 0) {
    await delay(devSettings.latencyMs);
  }

  // 2. Simulate Network Failure[cite: 1]
  if (devSettings.forceFailure) {
    throw new Error("Simulated Network Error: Service Unavailable (500)");
  }

  // 3. Mock Endpoint Routing[cite: 1]
  const url = new URL(endpoint, "https://mock.tapzacare.local");

  if (url.pathname === "/config") {
    return db.getConfig(devSettings.isFestivalTheme) as unknown as T;
  }

  if (url.pathname === "/doctors") {
    return db.getDoctors() as unknown as T;
  }

  if (url.pathname === "/slots") {
    const doctorId = url.searchParams.get("doctorId") || "doc-1";
    const date = url.searchParams.get("date") || "2026-09-30";
    return db.getSlots(doctorId, date) as unknown as T;
  }

  if (url.pathname === "/bookings" && method === "POST") {
    const parsed = typeof body === "string" ? JSON.parse(body) : body;
    const success = db.bookSlot(parsed.doctorId, parsed.slotId);
    if (!success) {
      throw { status: 409, message: "Slot already taken by another patient" }; // 409 Conflict[cite: 1]
    }
    return {
      id: `BK-${Date.now()}`,
      doctorId: parsed.doctorId,
      slotId: parsed.slotId,
      bookedAt: new Date().toISOString(),
      status: "confirmed",
    } as unknown as T;
  }

  if (url.pathname === "/prescriptions") {
    return db.getPrescriptions() as unknown as T;
  }

  throw new Error(`Endpoint ${endpoint} not found on mock engine`);
}
