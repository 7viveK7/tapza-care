import { useCallback, useEffect, useRef, useState } from "react";

import { storage, STORAGE_KEYS } from "@/core/storage/asyncStorage";
import { toISODate } from "@/shared/utils/date";
import type { Timing } from "@/types";

/**
 * Composite key that uniquely identifies one dose event.
 *
 *   `{prescriptionId}:{medicineId}:{date}:{timing}`
 *
 * Example: "rx-101:med-101-1:2026-09-30:morning"
 */
function doseKey(
  prescriptionId: string,
  medicineId: string,
  date: string,
  timing: Timing,
): string {
  return `${prescriptionId}:${medicineId}:${date}:${timing}`;
}

/**
 * Parse the stored flat map `Record<string, boolean>` into a typed lookup.
 *
 * `true`  → taken
 * `false` → explicitly skipped
 * absent  → not yet acted on
 */
export type DoseStatus = "taken" | "skipped" | "pending";

/** Shape stored in AsyncStorage: composite key → boolean (true = taken). */
type DoseMap = Record<string, boolean>;

export type UseDoseTrackerResult = {
  /** Returns the status for one dose entry. */
  getStatus: (
    prescriptionId: string,
    medicineId: string,
    date: string,
    timing: Timing,
  ) => DoseStatus;

  /**
   * Toggle a dose through the cycle: pending → taken → skipped → pending.
   *
   * Optimistic: state updates synchronously; AsyncStorage write happens in
   * the background. If the write fails the in-memory state remains (it will
   * be re-loaded next time the hook mounts).
   */
  toggle: (
    prescriptionId: string,
    medicineId: string,
    date: string,
    timing: Timing,
  ) => void;

  /** Whether the initial load from AsyncStorage is still in progress. */
  isLoading: boolean;
};

/**
 * Persists and exposes taken/skipped dose state for the current session.
 *
 * Usage:
 *   const { getStatus, toggle } = useDoseTracker();
 *   const status = getStatus("rx-101", "med-101-1", "2026-09-30", "morning");
 *   toggle("rx-101", "med-101-1", "2026-09-30", "morning");
 */
export function useDoseTracker(): UseDoseTrackerResult {
  const [doseMap, setDoseMap] = useState<DoseMap>({});
  const [isLoading, setIsLoading] = useState(true);
  // Keep a ref in sync so async callbacks always write the latest snapshot.
  const doseMapRef = useRef<DoseMap>({});

  // --- Load persisted state on mount ------------------------------------
  useEffect(() => {
    let cancelled = false;

    storage.get<DoseMap>(STORAGE_KEYS.DOSE_RECORDS).then((stored) => {
      if (cancelled) return;
      const value = stored ?? {};
      doseMapRef.current = value;
      setDoseMap(value);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // --- Derive status from map -------------------------------------------
  const getStatus = useCallback(
    (
      prescriptionId: string,
      medicineId: string,
      date: string,
      timing: Timing,
    ): DoseStatus => {
      const key = doseKey(prescriptionId, medicineId, date, timing);
      if (!(key in doseMapRef.current)) return "pending";
      return doseMapRef.current[key] ? "taken" : "skipped";
    },
    [],
  );

  // --- Optimistic toggle -----------------------------------------------
  const toggle = useCallback(
    (
      prescriptionId: string,
      medicineId: string,
      date: string,
      timing: Timing,
    ) => {
      const key = doseKey(prescriptionId, medicineId, date, timing);

      setDoseMap((prev) => {
        const currentStatus: DoseStatus =
          key in prev ? (prev[key] ? "taken" : "skipped") : "pending";

        // Cycle: pending → taken → skipped → pending
        let next: DoseMap;
        if (currentStatus === "pending") {
          next = { ...prev, [key]: true }; // mark taken
        } else if (currentStatus === "taken") {
          next = { ...prev, [key]: false }; // mark skipped
        } else {
          // skipped → remove key (back to pending)
          const { [key]: _removed, ...rest } = prev;
          next = rest;
        }

        // Keep ref in sync for the async write.
        doseMapRef.current = next;

        // Fire-and-forget persist — never blocks the UI.
        void storage.set<DoseMap>(STORAGE_KEYS.DOSE_RECORDS, next);

        return next;
      });
    },
    [],
  );

  return { getStatus, toggle, isLoading };
}

/**
 * Convenience: returns the ISO date string for "today" to pass into
 * `getStatus` / `toggle` without importing date utils at every call site.
 */
export function todayISODate(): string {
  return toISODate(new Date());
}
