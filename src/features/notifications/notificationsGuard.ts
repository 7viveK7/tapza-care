/**
 * Thin guard around expo-notifications for Expo Go compatibility.
 *
 * expo-notifications remote/scheduled notifications were removed from Expo Go
 * in SDK 53. Calling setNotificationHandler or scheduleNotificationAsync in
 * Expo Go throws immediately at runtime.
 *
 * This module detects that situation and silently no-ops every call so the
 * app runs normally in Expo Go. In a development build or production build,
 * all calls go straight through to expo-notifications unchanged.
 *
 * To get real notifications working, use a development build:
 *   npx expo run:ios   /   npx expo run:android
 */

import * as Notifications from "expo-notifications";

// ─── Capability detection ─────────────────────────────────────────────────────

/**
 * Returns true when expo-notifications is fully functional (development build
 * or production). Returns false in Expo Go SDK 53+.
 *
 * We probe with a synchronous call that Expo Go stubs throw on.
 */
function isNotificationsAvailable(): boolean {
  try {
    // getPermissionsAsync is async but instantiating it is synchronous.
    // In Expo Go it throws "functionality … was removed from Expo Go".
    // We just need to know if the module initialises without throwing.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export const notificationsAvailable: boolean = isNotificationsAvailable();

// ─── Safe wrappers ────────────────────────────────────────────────────────────

/**
 * Safe `setNotificationHandler` — no-ops silently in Expo Go.
 */
export function safeSetNotificationHandler(
  handler: Notifications.NotificationHandler,
): void {
  if (!notificationsAvailable) return;
  try {
    Notifications.setNotificationHandler(handler);
  } catch {
    // Expo Go
  }
}

/**
 * Safe `requestPermissionsAsync` — returns `{ granted: false }` in Expo Go.
 */
export async function safeRequestPermissions(): Promise<{ granted: boolean }> {
  if (!notificationsAvailable) return { granted: false };
  try {
    const result = await Notifications.requestPermissionsAsync();
    return { granted: result.status === "granted" };
  } catch {
    return { granted: false };
  }
}

/**
 * Safe `scheduleNotificationAsync` — no-ops in Expo Go.
 */
export async function safeScheduleNotification(
  request: Notifications.NotificationRequestInput,
): Promise<void> {
  if (!notificationsAvailable) return;
  try {
    await Notifications.scheduleNotificationAsync(request);
  } catch {
    // Expo Go
  }
}

/**
 * Safe `cancelScheduledNotificationAsync` — no-ops in Expo Go.
 */
export async function safeCancelNotification(id: string): Promise<void> {
  if (!notificationsAvailable) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Expo Go
  }
}

/**
 * Safe `addNotificationResponseReceivedListener` — returns a no-op
 * subscription in Expo Go.
 */
export function safeAddResponseListener(
  listener: (response: Notifications.NotificationResponse) => void,
): { remove: () => void } {
  if (!notificationsAvailable) return { remove: () => undefined };
  try {
    return Notifications.addNotificationResponseReceivedListener(listener);
  } catch {
    return { remove: () => undefined };
  }
}
