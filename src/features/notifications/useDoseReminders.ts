import * as Notifications from "expo-notifications";
import { useCallback } from "react";

import { t } from "@/shared/utils/i18n";
import type { Medicine, Prescription, Timing } from "@/types";

import {
    safeCancelNotification,
    safeRequestPermissions,
    safeScheduleNotification,
    safeSetNotificationHandler,
} from "./notificationsGuard";

// ─── Notification channel setup ───────────────────────────────────────────────

/**
 * Configure the default notification presentation behaviour.
 * Call once near app startup (e.g. in `app/_layout.tsx`).
 * No-ops silently in Expo Go.
 */
export function configureDoseNotifications(): void {
  safeSetNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ─── Timing → local hour mapping ─────────────────────────────────────────────

const TIMING_HOURS: Record<Timing, number> = {
  morning: 8, // 08:00
  afternoon: 13, // 13:00
  night: 21, // 21:00
};

// ─── Identifier helpers ───────────────────────────────────────────────────────

/**
 * Deterministic notification identifier for a single dose event.
 * Format: `dose:{prescriptionId}:{medicineId}:{timing}`
 */
function doseNotificationId(
  prescriptionId: string,
  medicineId: string,
  timing: Timing,
): string {
  return `dose:${prescriptionId}:${medicineId}:${timing}`;
}

// ─── Permission helper ────────────────────────────────────────────────────────

/**
 * Request notification permissions if not already granted.
 * Returns `true` if permission was granted, `false` otherwise.
 * Returns `false` in Expo Go without throwing.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { granted } = await safeRequestPermissions();
  return granted;
}

// ─── Schedule helpers ─────────────────────────────────────────────────────────

/**
 * Schedule a daily repeating dose reminder for one medicine timing slot.
 * No-ops silently in Expo Go.
 */
async function scheduleDoseReminder(
  prescriptionId: string,
  medicine: Medicine,
  timing: Timing,
): Promise<void> {
  const id = doseNotificationId(prescriptionId, medicine.id, timing);

  // Cancel any previous registration for this slot.
  await safeCancelNotification(id);

  const hour = TIMING_HOURS[timing];

  await safeScheduleNotification({
    identifier: id,
    content: {
      title: t("reminderTitle"),
      body: t("reminderBody", { medicine: medicine.name }),
      data: {
        prescriptionId,
        medicineId: medicine.id,
        timing,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

/**
 * Cancel all scheduled reminders for one medicine timing slot.
 */
async function cancelDoseReminder(
  prescriptionId: string,
  medicineId: string,
  timing: Timing,
): Promise<void> {
  const id = doseNotificationId(prescriptionId, medicineId, timing);
  await safeCancelNotification(id);
}

// ─── Public hook ──────────────────────────────────────────────────────────────

export type UseDoseRemindersResult = {
  /**
   * Schedule daily reminders for every timing slot in a prescription.
   * Requests permission first — silently does nothing if denied or in Expo Go.
   */
  scheduleRemindersForPrescription: (
    prescription: Prescription,
  ) => Promise<void>;

  /**
   * Cancel all reminders tied to a specific prescription.
   */
  cancelRemindersForPrescription: (prescription: Prescription) => Promise<void>;

  /**
   * Toggle reminders for a single medicine timing slot on/off.
   */
  toggleReminderForMedicine: (
    prescriptionId: string,
    medicine: Medicine,
    timing: Timing,
    enable: boolean,
  ) => Promise<void>;
};

/**
 * Hook for managing daily dose reminder notifications.
 *
 * Usage in PrescriptionDetailScreen:
 *
 *   const { scheduleRemindersForPrescription } = useDoseReminders();
 *   await scheduleRemindersForPrescription(prescription);
 */
export function useDoseReminders(): UseDoseRemindersResult {
  const scheduleRemindersForPrescription = useCallback(
    async (prescription: Prescription): Promise<void> => {
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      await Promise.all(
        prescription.medicines.flatMap((medicine) =>
          medicine.timing.map((timing) =>
            scheduleDoseReminder(prescription.id, medicine, timing),
          ),
        ),
      );
    },
    [],
  );

  const cancelRemindersForPrescription = useCallback(
    async (prescription: Prescription): Promise<void> => {
      await Promise.all(
        prescription.medicines.flatMap((medicine) =>
          medicine.timing.map((timing) =>
            cancelDoseReminder(prescription.id, medicine.id, timing),
          ),
        ),
      );
    },
    [],
  );

  const toggleReminderForMedicine = useCallback(
    async (
      prescriptionId: string,
      medicine: Medicine,
      timing: Timing,
      enable: boolean,
    ): Promise<void> => {
      if (enable) {
        const granted = await requestNotificationPermissions();
        if (!granted) return;
        await scheduleDoseReminder(prescriptionId, medicine, timing);
      } else {
        await cancelDoseReminder(prescriptionId, medicine.id, timing);
      }
    },
    [],
  );

  return {
    scheduleRemindersForPrescription,
    cancelRemindersForPrescription,
    toggleReminderForMedicine,
  };
}
