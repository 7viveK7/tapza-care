import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/core/theme/useTheme";
import { DevPanel } from "@/features/dev/DevPanel";
import { useHaptics } from "@/shared/hooks/useHaptics";

// ─── Backdrop ────────────────────────────────────────────────────────────────

function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.45}
    />
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginTop: theme.spacing.md }}>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.sizes.xs,
          fontWeight: "700",
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontSize: theme.typography.sizes.lg,
          fontWeight: "600",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { selectionFeedback, snapFeedback } = useHaptics();

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "95%"], []);

  const openDevPanel = useCallback(() => {
    selectionFeedback();
    sheetRef.current?.present();
  }, [selectionFeedback]);

  const closeDevPanel = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index >= 0) snapFeedback();
    },
    [snapFeedback],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View
          style={[
            styles.heroHeader,
            {
              paddingTop: insets.top + theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          {/* Avatar circle */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.surface + "30",
                width: 72,
                height: 72,
                borderRadius: 36,
              },
            ]}
          >
            <Text style={styles.avatarInitial}>T</Text>
          </View>

          <Text
            style={{
              color: theme.colors.surface,
              fontSize: theme.typography.sizes.xl,
              fontWeight: "800",
              marginTop: theme.spacing.md,
            }}
          >
            Tapza Care User
          </Text>
          <Text
            style={{
              color: theme.colors.surface + "BB",
              fontSize: theme.typography.sizes.sm,
              marginTop: 4,
            }}
          >
            Manage your account and care preferences
          </Text>
        </View>

        {/* ── Profile card ────────────────────────────────────────── */}
        <View
          style={[
            styles.card,
            {
              marginHorizontal: theme.spacing.md,
              marginTop: -20,
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: theme.spacing.lg,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.xs,
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Account Details
          </Text>
          <InfoRow label="Name" value="Tapza Care User" />
          <InfoRow label="Member ID" value="TAP-0001" />
          <InfoRow label="Region" value="Hyderabad & Vijayawada" />
        </View>

        {/* ── Quick links ─────────────────────────────────────────── */}
        <View
          style={[
            styles.card,
            {
              marginHorizontal: theme.spacing.md,
              marginTop: theme.spacing.md,
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              overflow: "hidden",
            },
          ]}
        >
          {[
            { icon: "🔔", label: "Notifications" },
            { icon: "🌐", label: "Language" },
            { icon: "🔒", label: "Privacy & Data" },
          ].map((item, i, arr) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              hitSlop={theme.accessibility.hitSlop}
              style={({ pressed }) => [
                styles.linkRow,
                {
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  minHeight: theme.typography.touchTargetMin,
                  backgroundColor: pressed
                    ? theme.colors.background
                    : "transparent",
                  borderBottomWidth:
                    i < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: theme.colors.textSecondary + "22",
                },
              ]}
            >
              <Text style={{ fontSize: 18, marginRight: theme.spacing.md }}>
                {item.icon}
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.md,
                  fontWeight: "500",
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizes.md,
                }}
              >
                ›
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Developer Panel button ───────────────────────────────── */}
        <View
          style={{
            marginHorizontal: theme.spacing.md,
            marginTop: theme.spacing.lg,
          }}
        >
          <Pressable
            onPress={openDevPanel}
            accessibilityRole="button"
            accessibilityLabel="Open developer panel"
            style={({ pressed }) => [
              styles.devButton,
              {
                minHeight: theme.typography.touchTargetMin,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: theme.colors.textSecondary + "44",
                backgroundColor: pressed
                  ? theme.colors.textSecondary + "11"
                  : "transparent",
                paddingHorizontal: theme.spacing.lg,
              },
            ]}
          >
            <Text style={{ fontSize: 18, marginRight: theme.spacing.sm }}>
              🛠
            </Text>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.md,
                fontWeight: "700",
              }}
            >
              Developer Panel
            </Text>
          </Pressable>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.xs,
              textAlign: "center",
              marginTop: theme.spacing.xs,
            }}
          >
            Latency · Force failure · Festival theme
          </Text>
        </View>
      </ScrollView>

      {/* ── DevPanel bottom sheet ────────────────────────────────────── */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        backdropComponent={Backdrop}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.textSecondary + "55",
          width: 36,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        enablePanDownToClose
      >
        <DevPanel onClose={closeDevPanel} />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  heroHeader: {},
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  devButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
