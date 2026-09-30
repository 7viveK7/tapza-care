import * as Haptics from "expo-haptics";
import { useCallback } from "react";

/**
 * Thin wrapper around expo-haptics that exposes named semantic actions.
 * Using named actions keeps call sites readable and lets us tune feedback
 * styles in one place.
 *
 * All functions are no-ops when Haptics is unavailable (e.g. simulators
 * without vibration hardware) — expo-haptics silently swallows those errors.
 */
export function useHaptics() {
  /** Light tick — use on every discrete selection (date chip, slot chip). */
  const selectionFeedback = useCallback(() => {
    void Haptics.selectionAsync();
  }, []);

  /** Medium impact — use on confirming a booking (CTA press). */
  const confirmFeedback = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /** Success notification — use after booking is confirmed by server. */
  const successFeedback = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  /** Error notification — use on 409 conflict or network error. */
  const errorFeedback = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  /** Heavy impact — use when bottom sheet snaps to a new position. */
  const snapFeedback = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return {
    selectionFeedback,
    confirmFeedback,
    successFeedback,
    errorFeedback,
    snapFeedback,
  };
}
