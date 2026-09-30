import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { LocaleProvider } from "@/core/i18n/LocaleContext";
import { QueryProvider } from "@/core/query/QueryProvider";
import { ThemeProvider } from "@/core/theme/ThemeContext";
import { safeAddResponseListener } from "@/features/notifications/notificationsGuard";
import { configureDoseNotifications } from "@/features/notifications/useDoseReminders";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// ─── Configure foreground notification presentation ───────────────────────────
// Called at module evaluation time (outside React) so the handler is in place
// before the very first notification arrives.
configureDoseNotifications();

// ─── Deep-link router ─────────────────────────────────────────────────────────

/**
 * Resolves a notification payload to an Expo Router path, or null if there
 * is nothing actionable to navigate to.
 *
 * Notification data shape (set in scheduleDoseReminder):
 *   { prescriptionId, medicineId, timing }
 *
 * DevPanel test-link shape:
 *   { deepLink: "doctor" | "prescription", id: string }
 */
function resolveNotificationRoute(
  data: Record<string, unknown>,
): string | null {
  // DevPanel "fire deep-link" test button
  if (
    typeof data.deepLink === "string" &&
    typeof data.id === "string" &&
    data.id
  ) {
    if (data.deepLink === "doctor") return `/doctor/${data.id}`;
    if (data.deepLink === "prescription") return `/prescription/${data.id}`;
  }

  // Real dose reminder — take user to the prescription detail screen
  if (typeof data.prescriptionId === "string" && data.prescriptionId) {
    return `/prescription/${data.prescriptionId}`;
  }

  return null;
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  // ── Notification tap → deep link ──────────────────────────────────────────
  useEffect(() => {
    // Handle taps on notifications received while the app is foregrounded,
    // backgrounded, or completely closed (last-notification-response).
    const subscription = safeAddResponseListener(
      (response: Notifications.NotificationResponse) => {
        const data = (response.notification.request.content.data ??
          {}) as Record<string, unknown>;
        const route = resolveNotificationRoute(data);
        if (route) {
          // router.push is safe to call here; Expo Router queues navigation
          // until the navigator is mounted.
          router.push(route as Parameters<typeof router.push>[0]);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  // ── Handle deep links that arrive while the app is already open ───────────
  // (tapzacare://doctor/doc-1  →  /doctor/doc-1)
  // Expo Router already handles scheme-based URLs automatically via the
  // `scheme` field in app.json and its own linking config, so no extra
  // Linking.addEventListener is needed here.

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryProvider>
        <ThemeProvider>
          <LocaleProvider>
            {/* BottomSheetModalProvider manages the portal layer for BottomSheetModal */}
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="doctor/[id]"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen name="prescription/[id]" />
              </Stack>
            </BottomSheetModalProvider>
          </LocaleProvider>
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
