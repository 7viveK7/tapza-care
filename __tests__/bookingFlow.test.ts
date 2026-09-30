/**
 * bookingFlow.test.ts
 *
 * Tests for the booking domain logic:
 *   1. apiClient GET /slots — slot generation, shape, errors
 *   2. apiClient POST /bookings — success path, availability update
 *   3. 409 conflict — SlotConflictError thrown and identifiable
 *   4. devSettings integration — forceFailure, reset()
 *   5. slotsQueryKey shape
 *   6. Optimistic update — QueryClient cache simulation
 */

import { QueryClient } from "@tanstack/react-query";

import { apiClient, ApiError, SlotConflictError } from "../src/core/api/client";
import { devSettings } from "../src/core/api/devSettings";
import { slotsQueryKey } from "../src/features/booking/hooks/useSlots";
import { db } from "../src/mock/db";
import type { BookingResponse, Slot } from "../src/types";

// ─── Constants & helpers ──────────────────────────────────────────────────────

const DOCTOR_ID = "doc-1";
const DATE = "2026-10-01";

function makeSlotId(suffix: string): string {
  return `${DOCTOR_ID}-${DATE}-${suffix}`;
}

async function fetchSlots(): Promise<Slot[]> {
  return apiClient<Slot[]>(`/slots?doctorId=${DOCTOR_ID}&date=${DATE}`);
}

// Reset both devSettings and the db booking state before every test so
// tests are fully isolated from each other.
beforeEach(() => {
  devSettings.reset();
  db.resetBookings();
});

// ─── 1. GET /slots ────────────────────────────────────────────────────────────

describe("apiClient — GET /slots", () => {
  it("returns 8 slots for a doctor+date combination", async () => {
    const slots = await fetchSlots();
    expect(slots).toHaveLength(8);
  });

  it("all returned slots belong to the requested doctor", async () => {
    const slots = await fetchSlots();
    slots.forEach((s) => expect(s.doctorId).toBe(DOCTOR_ID));
  });

  it("all slots are initially available", async () => {
    const slots = await fetchSlots();
    slots.forEach((s) => expect(s.available).toBe(true));
  });

  it("slot IDs follow the {doctorId}-{date}-{HHMM} format", async () => {
    const slots = await fetchSlots();
    slots.forEach((s) => expect(s.id).toMatch(/^doc-1-2026-10-01-\d{4}$/));
  });

  it("includes both morning (09xx) and evening (17xx–18xx) slots", async () => {
    const slots = await fetchSlots();
    expect(slots.some((s) => s.startsAt.includes("T09:"))).toBe(true);
    expect(
      slots.some(
        (s) => s.startsAt.includes("T17:") || s.startsAt.includes("T18:"),
      ),
    ).toBe(true);
  });

  it("startsAt values are ISO 8601 with IST offset", async () => {
    const slots = await fetchSlots();
    slots.forEach((s) => expect(s.startsAt).toMatch(/\+05:30$/));
  });

  it("throws ApiError(400) when doctorId param is missing", async () => {
    await expect(
      apiClient<Slot[]>(`/slots?date=${DATE}`),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("throws ApiError(400) when date param is missing", async () => {
    await expect(
      apiClient<Slot[]>(`/slots?doctorId=${DOCTOR_ID}`),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("throws ApiError(404) for an unknown endpoint", async () => {
    await expect(apiClient("/unknown")).rejects.toMatchObject({ status: 404 });
  });
});

// ─── 2. POST /bookings — success ─────────────────────────────────────────────

describe("apiClient — POST /bookings (success)", () => {
  it("returns a BookingResponse with status 'confirmed'", async () => {
    const targetSlotId = makeSlotId("0900");
    const booking = await apiClient<BookingResponse>("/bookings", {
      method: "POST",
      body: JSON.stringify({ doctorId: DOCTOR_ID, slotId: targetSlotId }),
    });
    expect(booking.status).toBe("confirmed");
    expect(booking.doctorId).toBe(DOCTOR_ID);
    expect(booking.slotId).toBe(targetSlotId);
    expect(booking.id).toMatch(/^BK-\d+$/);
    expect(typeof booking.bookedAt).toBe("string");
  });

  it("marks the booked slot unavailable in subsequent GET /slots", async () => {
    const targetSlotId = makeSlotId("0930");
    await apiClient<BookingResponse>("/bookings", {
      method: "POST",
      body: JSON.stringify({ doctorId: DOCTOR_ID, slotId: targetSlotId }),
    });
    const slots = await fetchSlots();
    const booked = slots.find((s) => s.id === targetSlotId);
    expect(booked?.available).toBe(false);
    slots
      .filter((s) => s.id !== targetSlotId)
      .forEach((s) => expect(s.available).toBe(true));
  });

  it("throws ApiError(400) when slotId is missing from body", async () => {
    await expect(
      apiClient<BookingResponse>("/bookings", {
        method: "POST",
        body: JSON.stringify({ doctorId: DOCTOR_ID }),
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("throws ApiError(400) when doctorId is an empty string", async () => {
    await expect(
      apiClient<BookingResponse>("/bookings", {
        method: "POST",
        body: JSON.stringify({ doctorId: "", slotId: makeSlotId("1000") }),
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

// ─── 3. 409 conflict — SlotConflictError ─────────────────────────────────────

describe("apiClient — POST /bookings (409 conflict)", () => {
  it("throws SlotConflictError when the same slot is booked twice", async () => {
    const targetSlotId = makeSlotId("1000");
    const body = JSON.stringify({ doctorId: DOCTOR_ID, slotId: targetSlotId });
    await apiClient<BookingResponse>("/bookings", { method: "POST", body });
    await expect(
      apiClient<BookingResponse>("/bookings", { method: "POST", body }),
    ).rejects.toThrow(SlotConflictError);
  });

  it("SlotConflictError.status is 409", async () => {
    const targetSlotId = makeSlotId("1030");
    const body = JSON.stringify({ doctorId: DOCTOR_ID, slotId: targetSlotId });
    await apiClient<BookingResponse>("/bookings", { method: "POST", body });
    try {
      await apiClient<BookingResponse>("/bookings", { method: "POST", body });
      throw new Error("Expected SlotConflictError");
    } catch (err) {
      expect(err).toBeInstanceOf(SlotConflictError);
      expect((err as SlotConflictError).status).toBe(409);
    }
  });

  it("SlotConflictError is an instanceof ApiError", async () => {
    const targetSlotId = makeSlotId("1100");
    const body = JSON.stringify({ doctorId: DOCTOR_ID, slotId: targetSlotId });
    await apiClient<BookingResponse>("/bookings", { method: "POST", body });
    await expect(
      apiClient<BookingResponse>("/bookings", { method: "POST", body }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("onError 409 detection logic correctly identifies SlotConflictError", async () => {
    const targetSlotId = makeSlotId("1730");
    const body = JSON.stringify({ doctorId: DOCTOR_ID, slotId: targetSlotId });
    await apiClient<BookingResponse>("/bookings", { method: "POST", body });

    let caughtError: Error | null = null;
    try {
      await apiClient<BookingResponse>("/bookings", { method: "POST", body });
    } catch (err) {
      caughtError = err as Error;
    }

    expect(caughtError).not.toBeNull();
    // Exact logic from useBookSlot.ts onError:
    const is409 =
      caughtError instanceof SlotConflictError ||
      ("status" in (caughtError as object) &&
        (caughtError as { status: number }).status === 409);
    expect(is409).toBe(true);
  });

  it("a different slot remains bookable after a conflict on another slot", async () => {
    const conflictSlotId = makeSlotId("1800");
    const otherSlotId = makeSlotId("0900"); // different suffix — fresh in this test
    const conflictBody = JSON.stringify({
      doctorId: DOCTOR_ID,
      slotId: conflictSlotId,
    });

    // Book the conflict slot once
    await apiClient<BookingResponse>("/bookings", {
      method: "POST",
      body: conflictBody,
    });
    // Second attempt on the same slot → conflict
    await expect(
      apiClient<BookingResponse>("/bookings", {
        method: "POST",
        body: conflictBody,
      }),
    ).rejects.toBeInstanceOf(SlotConflictError);

    // A completely different slot should still succeed
    const otherBooking = await apiClient<BookingResponse>("/bookings", {
      method: "POST",
      body: JSON.stringify({ doctorId: DOCTOR_ID, slotId: otherSlotId }),
    });
    expect(otherBooking.status).toBe("confirmed");
  });
});

// ─── 4. devSettings integration ───────────────────────────────────────────────

describe("devSettings integration", () => {
  it("forceFailure causes apiClient to throw ApiError(500)", async () => {
    devSettings.forceFailure = true;
    await expect(fetchSlots()).rejects.toMatchObject({ status: 500 });
  });

  it("disabling forceFailure restores normal operation", async () => {
    devSettings.forceFailure = true;
    devSettings.forceFailure = false;
    const slots = await fetchSlots();
    expect(slots).toHaveLength(8);
  });

  it("reset() restores all fields to defaults", () => {
    devSettings.latencyMs = 1500;
    devSettings.forceFailure = true;
    devSettings.isFestivalTheme = true;
    devSettings.reset();
    expect(devSettings.latencyMs).toBe(0);
    expect(devSettings.forceFailure).toBe(false);
    expect(devSettings.isFestivalTheme).toBe(false);
  });

  it("isFestivalTheme does not affect slot count or availability", async () => {
    devSettings.isFestivalTheme = true;
    const slots = await fetchSlots();
    expect(slots).toHaveLength(8);
    slots.forEach((s) => expect(s.available).toBe(true));
  });
});

// ─── 5. slotsQueryKey shape ───────────────────────────────────────────────────

describe("slotsQueryKey", () => {
  it("returns a readonly tuple ['slots', doctorId, date]", () => {
    const key = slotsQueryKey("doc-1", "2026-10-01");
    expect(key).toEqual(["slots", "doc-1", "2026-10-01"]);
  });

  it("produces different keys for different doctors", () => {
    expect(slotsQueryKey("doc-1", DATE)).not.toEqual(
      slotsQueryKey("doc-2", DATE),
    );
  });

  it("produces different keys for different dates", () => {
    expect(slotsQueryKey(DOCTOR_ID, "2026-10-01")).not.toEqual(
      slotsQueryKey(DOCTOR_ID, "2026-10-02"),
    );
  });
});

// ─── 6. Optimistic update — QueryClient cache simulation ──────────────────────

describe("Optimistic update — QueryClient cache simulation", () => {
  const queryKey = slotsQueryKey(DOCTOR_ID, DATE);

  async function seedCache(qc: QueryClient): Promise<Slot[]> {
    const slots = await fetchSlots();
    qc.setQueryData<Slot[]>(queryKey, slots);
    return slots;
  }

  it("snapshot before optimistic write contains 8 available slots", async () => {
    const qc = new QueryClient();
    const original = await seedCache(qc);
    const snapshot = qc.getQueryData<Slot[]>(queryKey);
    expect(snapshot).toHaveLength(8);
    snapshot!.forEach((s) => expect(s.available).toBe(true));
    expect(snapshot).toEqual(original);
  });

  it("optimistic write marks only the target slot as unavailable", async () => {
    const qc = new QueryClient();
    await seedCache(qc);
    const targetId = makeSlotId("0900");

    // Simulate onMutate optimistic write from useBookSlot.ts
    qc.setQueryData<Slot[]>(queryKey, (old) =>
      (old ?? []).map((slot) =>
        slot.id === targetId ? { ...slot, available: false } : slot,
      ),
    );

    const updated = qc.getQueryData<Slot[]>(queryKey)!;
    expect(updated.find((s) => s.id === targetId)?.available).toBe(false);
    updated
      .filter((s) => s.id !== targetId)
      .forEach((s) => expect(s.available).toBe(true));
  });

  it("rollback on error restores all slots to their original state", async () => {
    const qc = new QueryClient();
    await seedCache(qc);
    const targetId = makeSlotId("0900");

    // Step 1: snapshot
    const previousSlots = qc.getQueryData<Slot[]>(queryKey);

    // Step 2: optimistic write
    qc.setQueryData<Slot[]>(queryKey, (old) =>
      (old ?? []).map((s) =>
        s.id === targetId ? { ...s, available: false } : s,
      ),
    );
    expect(
      qc.getQueryData<Slot[]>(queryKey)!.find((s) => s.id === targetId)
        ?.available,
    ).toBe(false);

    // Step 3: rollback (simulates onError in useBookSlot.ts)
    qc.setQueryData(queryKey, previousSlots);

    const afterRollback = qc.getQueryData<Slot[]>(queryKey)!;
    afterRollback.forEach((s) => expect(s.available).toBe(true));
  });

  it("rollback with undefined previousSlots clears the query data", async () => {
    const qc = new QueryClient();
    // Do NOT seed — previousSlots is undefined
    const previousSlots = qc.getQueryData<Slot[]>(queryKey); // undefined
    expect(previousSlots).toBeUndefined();

    // Optimistic write
    qc.setQueryData<Slot[]>(queryKey, []);
    expect(qc.getQueryData<Slot[]>(queryKey)).toEqual([]);

    // Rollback: in React Query v5, setting to undefined removes the entry
    // Use removeQueries to simulate a true rollback to "no cache" state
    qc.removeQueries({ queryKey });
    expect(qc.getQueryData<Slot[]>(queryKey)).toBeUndefined();
  });

  it("optimistic write does not mutate a different doctor's query key", async () => {
    const qc = new QueryClient();
    await seedCache(qc);
    const otherKey = slotsQueryKey("doc-2", DATE);

    // doc-2 key is not seeded → undefined
    expect(qc.getQueryData<Slot[]>(otherKey)).toBeUndefined();

    // Optimistically write to doc-1's key
    qc.setQueryData<Slot[]>(queryKey, (old) =>
      (old ?? []).map((s) => ({ ...s, available: false })),
    );

    // doc-2's key is still untouched
    expect(qc.getQueryData<Slot[]>(otherKey)).toBeUndefined();
  });

  it("full cycle: seed → optimistic update → rollback → re-seed is consistent", async () => {
    const qc = new QueryClient();

    // Seed
    await seedCache(qc);
    const snapshot = [...qc.getQueryData<Slot[]>(queryKey)!];

    // Optimistic update
    const targetId = makeSlotId("1700");
    qc.setQueryData<Slot[]>(queryKey, (old) =>
      (old ?? []).map((s) =>
        s.id === targetId ? { ...s, available: false } : s,
      ),
    );

    // Rollback
    qc.setQueryData(queryKey, snapshot);

    // State should exactly match the original snapshot
    expect(qc.getQueryData<Slot[]>(queryKey)).toEqual(snapshot);
  });
});
