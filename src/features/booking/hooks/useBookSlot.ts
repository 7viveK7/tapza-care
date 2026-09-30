import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

import { apiClient, SlotConflictError } from "@/core/api/client";
import type { BookingPayload, BookingResponse, Slot } from "@/types";

import { slotsQueryKey } from "./useSlots";

type BookSlotArgs = {
  payload: BookingPayload;
  /** Calendar date string "YYYY-MM-DD" — needed to invalidate the right slots query. */
  date: string;
  /** Human-readable "slot taken" message, sourced from LayoutConfig.copy.slotUnavailable. */
  conflictMessage?: string;
};

type OptimisticContext = {
  previousSlots: Slot[] | undefined;
  queryKey: readonly ["slots", string, string];
};

/**
 * Mutation hook for POST /bookings.
 *
 * Optimistic update:
 *   Before the request resolves, the target slot's `available` flag is set to
 *   `false` in the React Query cache so the UI reflects the booking immediately.
 *
 * Rollback:
 *   On 409 SlotConflictError (or any other error), the previous cache snapshot
 *   is restored and an Alert is shown to the user.
 *
 * Success:
 *   The slots query for that doctor+date is invalidated so the list refetches
 *   from the server with the authoritative availability state.
 */
export function useBookSlot(onSuccess?: (booking: BookingResponse) => void) {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, BookSlotArgs, OptimisticContext>({
    mutationFn: ({ payload }) =>
      apiClient<BookingResponse>("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    // --- Optimistic update -------------------------------------------
    onMutate: async ({ payload, date }) => {
      const queryKey = slotsQueryKey(payload.doctorId, date);

      // Cancel any in-flight refetch so it doesn't overwrite our optimistic write.
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback.
      const previousSlots = queryClient.getQueryData<Slot[]>(queryKey);

      // Optimistically mark the slot as unavailable.
      queryClient.setQueryData<Slot[]>(queryKey, (old) =>
        (old ?? []).map((slot) =>
          slot.id === payload.slotId ? { ...slot, available: false } : slot,
        ),
      );

      return { previousSlots, queryKey };
    },

    // --- Rollback on any error ---------------------------------------
    onError: (error, { conflictMessage }, context) => {
      // Restore previous cache state.
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousSlots);
      }

      const is409 =
        error instanceof SlotConflictError ||
        ("status" in error && (error as { status: number }).status === 409);

      const title = is409 ? "Slot no longer available" : "Booking failed";
      const message = is409
        ? (conflictMessage ??
          "This slot was just taken. Please pick another time.")
        : "We couldn't confirm your booking. Please try again.";

      Alert.alert(title, message, [{ text: "OK", style: "default" }]);
    },

    // --- Invalidate on success so server state is authoritative ------
    onSuccess: (booking, { payload, date }) => {
      void queryClient.invalidateQueries({
        queryKey: slotsQueryKey(payload.doctorId, date),
      });
      onSuccess?.(booking);
    },
  });
}
