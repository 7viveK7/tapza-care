import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/core/api/client";
import type { Slot } from "@/types";

export const slotsQueryKey = (doctorId: string, date: string) =>
  ["slots", doctorId, date] as const;

/**
 * Fetch available slots for a given doctor on a given calendar date.
 *
 * @param doctorId - The doctor's ID (e.g. "doc-1")
 * @param date     - ISO calendar date string "YYYY-MM-DD"
 *
 * The query is disabled when either param is empty so callers can pass
 * them unconditionally without triggering a premature network call.
 */
export function useSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: slotsQueryKey(doctorId, date),
    queryFn: () =>
      apiClient<Slot[]>(
        `/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`,
      ),
    enabled: doctorId.length > 0 && date.length > 0,
    // Slots are only valid for the current session — don't serve stale data.
    staleTime: 0,
  });
}
