import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/core/theme/useTheme";
import type { DoseStatus } from "@/features/prescriptions/hooks/useDoseTracker";
import { useHaptics } from "@/shared/hooks/useHaptics";
import type { Medicine, Prescription, Timing } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_ORDER: Timing[] = ["morning", "afternoon", "night"];

const PERIOD_META: Record<
  Timing,
  { label: string; icon: string; timeHint: string }
> = {
  morning: { label: "Morning", icon: "🌅", timeHint: "Before 12 PM" },
  afternoon: { label: "Afternoon", icon: "☀️", timeHint: "12 PM – 5 PM" },
  night: { label: "Night", icon: "🌙", timeHint: "After 8 PM" },
};

const STATUS_META: Record<
  DoseStatus,
  { label: string; bg: string; fg: string; icon: string }
> = {
  pending: { label: "Mark taken", bg: "transparent", fg: "#64748B", icon: "○" },
  taken: { label: "Taken", bg: "#0F766E", fg: "#FFFFFF", icon: "✓" },
  skipped: { label: "Skipped", bg: "#EF4444", fg: "#FFFFFF", icon: "✕" },
};

// ─── DoseChip ─────────────────────────────────────────────────────────────────

type DoseChipProps = {
  medicineName: string;
  status: DoseStatus;
  onToggle: () => void;
};

function DoseChip({ medicineName, status, onToggle }: DoseChipProps) {
  const { theme } = useTheme();
  const { selectionFeedback } = useHaptics();
  const scale = useSharedValue(1);

  const meta = STATUS_META[status];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    selectionFeedback();
    // Tiny bounce to confirm the tap
    scale.value = withSpring(0.92, { damping: 6, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
    onToggle();
  }, [selectionFeedback, scale, onToggle]);

  const isBordered = status === "pending";

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="checkbox"
        accessibilityLabel={`${medicineName} — ${meta.label}`}
        accessibilityState={{ checked: status === "taken" }}
        hitSlop={theme.accessibility.hitSlop}
        style={[
          styles.doseChip,
          {
            minHeight: theme.typography.touchTargetMin,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            borderWidth: isBordered ? 1.5 : 0,
            borderColor: isBordered
              ? theme.colors.textSecondary + "55"
              : "transparent",
            backgroundColor:
              status === "taken"
                ? theme.colors.primary
                : status === "skipped"
                  ? "#EF4444"
                  : theme.colors.surface,
          },
        ]}
      >
        <View style={styles.chipInner}>
          {/* Status icon */}
          <Text
            style={[
              styles.chipIcon,
              {
                fontSize: theme.typography.sizes.md,
                color:
                  status === "pending" ? theme.colors.textSecondary : "#FFFFFF",
              },
            ]}
            accessibilityElementsHidden
          >
            {meta.icon}
          </Text>

          <View style={styles.chipText}>
            {/* Medicine name — large for older-user readability */}
            <Text
              style={{
                color:
                  status === "pending" ? theme.colors.textPrimary : "#FFFFFF",
                fontSize: theme.typography.sizes.md,
                fontWeight: "700",
                lineHeight: 22,
              }}
              numberOfLines={1}
            >
              {medicineName}
            </Text>
            {/* Status label */}
            <Text
              style={{
                color:
                  status === "pending"
                    ? theme.colors.textSecondary
                    : "#FFFFFFCC",
                fontSize: theme.typography.sizes.xs,
                marginTop: 1,
              }}
            >
              {meta.label}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── PeriodSection ────────────────────────────────────────────────────────────

type PeriodSectionProps = {
  timing: Timing;
  medicines: { medicine: Medicine; status: DoseStatus }[];
  onToggle: (medicineId: string, timing: Timing) => void;
};

function PeriodSection({ timing, medicines, onToggle }: PeriodSectionProps) {
  const { theme } = useTheme();
  const meta = PERIOD_META[timing];

  const takenCount = medicines.filter((m) => m.status === "taken").length;
  const allTaken = takenCount === medicines.length;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        styles.periodSection,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: allTaken
            ? theme.colors.primary + "33"
            : theme.colors.textSecondary + "18",
        },
      ]}
    >
      {/* Section header */}
      <View style={styles.periodHeader}>
        <View style={styles.periodHeaderLeft}>
          <Text style={styles.periodIcon} accessibilityElementsHidden>
            {meta.icon}
          </Text>
          <View>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.typography.sizes.lg,
                fontWeight: "800",
                lineHeight: 24,
              }}
            >
              {meta.label}
            </Text>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.xs,
              }}
            >
              {meta.timeHint}
            </Text>
          </View>
        </View>

        {/* Progress badge */}
        <View
          style={[
            styles.progressBadge,
            {
              backgroundColor: allTaken
                ? theme.colors.primary + "18"
                : theme.colors.textSecondary + "12",
              borderRadius: 999,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 3,
            },
          ]}
        >
          <Text
            style={{
              color: allTaken
                ? theme.colors.primary
                : theme.colors.textSecondary,
              fontSize: theme.typography.sizes.xs,
              fontWeight: "700",
            }}
          >
            {takenCount}/{medicines.length}
          </Text>
        </View>
      </View>

      {/* Dose chips */}
      <View
        style={[
          styles.chipsColumn,
          { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
        ]}
      >
        {medicines.map(({ medicine, status }) => (
          <DoseChip
            key={medicine.id}
            medicineName={medicine.name}
            status={status}
            onToggle={() => onToggle(medicine.id, timing)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// ─── DoseSchedule (public) ────────────────────────────────────────────────────

type Props = {
  prescription: Prescription;
  /** ISO date for which to show/track doses. Defaults to today. */
  date: string;
  getStatus: (
    prescriptionId: string,
    medicineId: string,
    date: string,
    timing: Timing,
  ) => DoseStatus;
  toggle: (
    prescriptionId: string,
    medicineId: string,
    date: string,
    timing: Timing,
  ) => void;
};

/**
 * Renders the full day's dose schedule grouped by morning / afternoon / night.
 *
 * Each period shows the medicines that need to be taken at that time along
 * with an interactive chip that cycles: pending → taken → skipped → pending.
 *
 * Designed for high contrast and large touch targets (≥44pt) to support
 * older users.
 */
export function DoseSchedule({ prescription, date, getStatus, toggle }: Props) {
  const { theme } = useTheme();

  // Group medicines by timing period
  const byTiming = PERIOD_ORDER.reduce<
    Record<Timing, Array<{ medicine: Medicine; status: DoseStatus }>>
  >(
    (acc, timing) => {
      acc[timing] = prescription.medicines
        .filter((m) => m.timing.includes(timing))
        .map((m) => ({
          medicine: m,
          status: getStatus(prescription.id, m.id, date, timing),
        }));
      return acc;
    },
    { morning: [], afternoon: [], night: [] },
  );

  const activePeriods = PERIOD_ORDER.filter((t) => byTiming[t].length > 0);

  if (activePeriods.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.md }}>
      {activePeriods.map((timing) => (
        <PeriodSection
          key={timing}
          timing={timing}
          medicines={byTiming[timing]}
          onToggle={(medicineId, t) =>
            toggle(prescription.id, medicineId, date, t)
          }
        />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  periodSection: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  periodHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  periodIcon: {
    fontSize: 24,
  },
  progressBadge: {},
  chipsColumn: {},
  doseChip: {},
  chipInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chipIcon: {
    fontWeight: "700",
    width: 20,
    textAlign: "center",
  },
  chipText: {
    flex: 1,
  },
});
