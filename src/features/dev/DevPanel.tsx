import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { devSettings } from "@/core/api/devSettings";
import { clearConfigCache } from "@/core/config/cache";
import type { AppTheme } from "@/core/theme/createTheme";
import { useTheme } from "@/core/theme/useTheme";
import { layoutConfigQueryKey } from "@/features/home/useLayoutConfig";
import { useHaptics } from "@/shared/hooks/useHaptics";

// ─── Hardcoded festival tokens (matches config.festival.json) ──────────────────
// We apply them directly so the theme switches instantly without waiting for
// the query re-fetch to complete.
const FESTIVAL_TOKENS = {
  primary: "#B45309",
  secondary: "#7C2D12",
  background: "#FFF7ED",
  surface: "#FFEDD5",
  textPrimary: "#431407",
  textSecondary: "#9A3412",
  accent: "#CA8A04",
  festival: "#DC2626",
  spacingScale: 1,
  typeScale: 1,
} as const;

const NORMAL_TOKENS = {
  primary: "#0F766E",
  secondary: "#115E59",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  accent: "#0284C7",
  spacingScale: 1,
  typeScale: 1,
} as const;

// ─── Latency presets ───────────────────────────────────────────────────────────

const LATENCY_PRESETS = [0, 300, 800, 1500, 2000] as const;
type LatencyPreset = (typeof LATENCY_PRESETS)[number];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SectionLabel({ label, theme }: { label: string; theme: AppTheme }) {
  return (
    <Text
      style={{
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.xs,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.lg,
      }}
    >
      {label}
    </Text>
  );
}

function SettingRow({
  label,
  description,
  children,
  theme,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  theme: AppTheme;
}) {
  return (
    <View
      style={[
        styles.settingRow,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        },
      ]}
    >
      <View style={styles.settingLabelWrap}>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.md,
            fontWeight: "600",
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.xs,
              marginTop: 2,
              lineHeight: 16,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

// ─── DevPanel ──────────────────────────────────────────────────────────────────

type Props = {
  /** Called when the panel requests dismissal (e.g. after Reset). */
  onClose?: () => void;
};

export function DevPanel({ onClose }: Props) {
  const { theme, updateThemeTokens } = useTheme();
  const queryClient = useQueryClient();
  const { selectionFeedback, themeSwitchFeedback, errorFeedback } =
    useHaptics();

  // ── Local UI state mirrors devSettings so re-renders stay reactive ────────
  const [latencyMs, setLatencyMs] = useState<number>(devSettings.latencyMs);
  const [forceFailure, setForceFailure] = useState<boolean>(
    devSettings.forceFailure,
  );
  const [isFestival, setIsFestival] = useState<boolean>(
    devSettings.isFestivalTheme,
  );

  // Shared value for the "flash" effect on the status badge
  const badgeScale = useSharedValue(1);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  // ── Invalidate config query so HomeScreen refetches immediately ───────────
  const invalidateConfig = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: layoutConfigQueryKey });
  }, [queryClient]);

  const flashBadge = useCallback(() => {
    badgeScale.value = withSpring(1.25, { damping: 5 }, () => {
      badgeScale.value = withSpring(1);
    });
  }, [badgeScale]);

  // ── Latency ───────────────────────────────────────────────────────────────
  const handleLatencySelect = useCallback(
    (ms: LatencyPreset) => {
      selectionFeedback();
      devSettings.latencyMs = ms;
      setLatencyMs(ms);
      flashBadge();
    },
    [selectionFeedback, flashBadge],
  );

  // ── Force failure ─────────────────────────────────────────────────────────
  const handleForceFailureToggle = useCallback(
    (value: boolean) => {
      value ? errorFeedback() : selectionFeedback();
      devSettings.forceFailure = value;
      setForceFailure(value);
      // Immediately re-trigger the config fetch so the error state appears
      // without the user needing to navigate away and back.
      invalidateConfig();
      flashBadge();
    },
    [errorFeedback, selectionFeedback, invalidateConfig, flashBadge],
  );

  // ── Festival theme ────────────────────────────────────────────────────────
  const handleFestivalToggle = useCallback(
    (value: boolean) => {
      themeSwitchFeedback();
      devSettings.isFestivalTheme = value;
      setIsFestival(value);

      // 1. Apply tokens instantly — every useTheme() consumer re-renders.
      updateThemeTokens(value ? FESTIVAL_TOKENS : NORMAL_TOKENS);

      // 2. Also invalidate so HomeScreen's query re-fetches with the new
      //    isFestivalTheme flag baked into the query key.
      invalidateConfig();
      flashBadge();
    },
    [themeSwitchFeedback, updateThemeTokens, invalidateConfig, flashBadge],
  );

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    Alert.alert(
      "Reset Dev Settings",
      "This will clear all overrides, the config cache, and refetch from the server.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            selectionFeedback();
            devSettings.reset();
            setLatencyMs(0);
            setForceFailure(false);
            setIsFestival(false);
            updateThemeTokens(NORMAL_TOKENS);
            await clearConfigCache();
            invalidateConfig();
            onClose?.();
          },
        },
      ],
    );
  }, [selectionFeedback, updateThemeTokens, invalidateConfig, onClose]);

  // ── Status badge ──────────────────────────────────────────────────────────
  const isActive = latencyMs > 0 || forceFailure || isFestival;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.textSecondary + "22",
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.lg,
              fontWeight: "800",
            }}
          >
            🛠 Developer Panel
          </Text>
          <Animated.View style={badgeStyle}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isActive
                    ? "#EF4444"
                    : theme.colors.primary + "22",
                  borderRadius: 999,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 2,
                  marginLeft: theme.spacing.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: isActive ? "#FFFFFF" : theme.colors.primary,
                  fontSize: theme.typography.sizes.xs,
                  fontWeight: "800",
                }}
              >
                {isActive ? "OVERRIDES ON" : "DEFAULT"}
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* ── Scrollable controls ───────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Network ───────────────────────────────────────────────── */}
        <SectionLabel label="Network" theme={theme} />

        {/* Latency presets */}
        <View
          style={[
            styles.settingRow,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.md,
              marginBottom: theme.spacing.sm,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.md,
              fontWeight: "600",
              marginBottom: theme.spacing.sm,
            }}
          >
            Network Latency
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.xs,
              marginBottom: theme.spacing.sm,
            }}
          >
            Simulated delay applied to every API call
          </Text>
          <View style={[styles.chipsRow, { gap: theme.spacing.sm }]}>
            {LATENCY_PRESETS.map((ms) => {
              const selected = latencyMs === ms;
              return (
                <Pressable
                  key={ms}
                  onPress={() => handleLatencySelect(ms)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set latency to ${ms} milliseconds`}
                  accessibilityState={{ selected }}
                  style={[
                    styles.latencyChip,
                    {
                      minHeight: theme.typography.touchTargetMin,
                      paddingHorizontal: theme.spacing.md,
                      borderRadius: 10,
                      borderWidth: 1.5,
                      backgroundColor: selected
                        ? theme.colors.primary
                        : "transparent",
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.textSecondary + "44",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selected
                        ? theme.colors.surface
                        : theme.colors.textPrimary,
                      fontSize: theme.typography.sizes.sm,
                      fontWeight: "700",
                    }}
                  >
                    {ms === 0 ? "0 ms" : `${ms} ms`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Force failure */}
        <SettingRow
          label="Force Network Failure"
          description="Every API call throws a 500 error — tests retry/error states"
          theme={theme}
        >
          <Switch
            value={forceFailure}
            onValueChange={handleForceFailureToggle}
            trackColor={{
              false: theme.colors.textSecondary + "33",
              true: "#EF4444",
            }}
            thumbColor={theme.colors.surface}
            accessibilityLabel="Force network failure"
            accessibilityRole="switch"
          />
        </SettingRow>

        {/* ── Theme ─────────────────────────────────────────────────── */}
        <SectionLabel label="Theme" theme={theme} />

        <SettingRow
          label="Festival Theme (Diwali) 🪔"
          description="Switches layout config and all colours to the festival palette"
          theme={theme}
        >
          <Switch
            value={isFestival}
            onValueChange={handleFestivalToggle}
            trackColor={{
              false: theme.colors.textSecondary + "33",
              true: "#B45309",
            }}
            thumbColor={theme.colors.surface}
            accessibilityLabel="Festival theme toggle"
            accessibilityRole="switch"
          />
        </SettingRow>

        {/* ── Active overrides summary ───────────────────────────────── */}
        {isActive ? (
          <View
            style={[
              styles.summaryBox,
              {
                marginTop: theme.spacing.sm,
                backgroundColor: "#EF444414",
                borderRadius: 12,
                padding: theme.spacing.md,
                borderWidth: 1,
                borderColor: "#EF444440",
              },
            ]}
          >
            <Text
              style={{
                color: "#B91C1C",
                fontSize: theme.typography.sizes.sm,
                fontWeight: "800",
                marginBottom: theme.spacing.xs,
              }}
            >
              Active overrides
            </Text>
            {latencyMs > 0 && (
              <Text
                style={{
                  color: "#B91C1C",
                  fontSize: theme.typography.sizes.sm,
                }}
              >
                • Latency: {latencyMs} ms
              </Text>
            )}
            {forceFailure && (
              <Text
                style={{
                  color: "#B91C1C",
                  fontSize: theme.typography.sizes.sm,
                }}
              >
                • Force failure: ON
              </Text>
            )}
            {isFestival && (
              <Text
                style={{
                  color: "#B91C1C",
                  fontSize: theme.typography.sizes.sm,
                }}
              >
                • Festival theme: ON
              </Text>
            )}
          </View>
        ) : null}

        {/* ── Reset ─────────────────────────────────────────────────── */}
        <SectionLabel label="Danger Zone" theme={theme} />

        <Pressable
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Reset all developer settings"
          style={({ pressed }) => [
            styles.resetButton,
            {
              minHeight: theme.typography.touchTargetMin,
              borderRadius: 12,
              backgroundColor: pressed ? "#B91C1C" : "#EF4444",
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: theme.typography.sizes.md,
              fontWeight: "700",
            }}
          >
            Reset All Settings & Cache
          </Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {},
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLabelWrap: {
    flex: 1,
    marginRight: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  latencyChip: {
    alignItems: "center",
    justifyContent: "center",
  },
  summaryBox: {},
  resetButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
