import * as Haptics from "expo-haptics";
import { useCallback } from "react";

/**
 * Thin wrapper around expo-haptics that exposes named semantic actions.
 *
 * Naming actions rather than exposing raw haptics styles keeps call sites
 * readable and lets us tune feedback styles in one place.
 *
 * All functions are no-ops when Haptics is unavailable (e.g. simulators
 * without vibration hardware) — expo-haptics silently swallows those errors.
 */
export function useHaptics() {
  /** Light tick — every discrete selection (date chip, slot chip, category). */
  const selectionFeedback = useCallback(() => {
    void Haptics.selectionAsync();
  }, []);

  /** Medium impact — confirming a booking (CTA press). */
  const confirmFeedback = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /** Success notification — after booking is confirmed by server. */
  const successFeedback = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  /** Error notification — on 409 conflict or network error. */
  const errorFeedback = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  /** Light impact — when a bottom sheet snaps to a new position. */
  const snapFeedback = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  /**
   * Heavy impact — when the user switches between Normal and Festival theme.
   * A stronger physical signal reinforces the large visual change.
   */
  const themeSwitchFeedback = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  /**
   * Selection tick — on every dose Taken / Skipped toggle in DoseSchedule.
   * Same weight as selectionFeedback; kept separate for semantic clarity.
   */
  const doseToggleFeedback = useCallback(() => {
    void Haptics.selectionAsync();
  }, []);

  return {
    selectionFeedback,
    confirmFeedback,
    successFeedback,
    errorFeedback,
    snapFeedback,
    themeSwitchFeedback,
    doseToggleFeedback,
  };
}
