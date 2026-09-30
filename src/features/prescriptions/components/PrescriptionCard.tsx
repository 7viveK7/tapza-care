import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/core/theme/useTheme";
import type { Prescription } from "@/types";

type Props = {
  prescription: Prescription;
  index?: number;
  onPress: (id: string) => void;
};

const TIMING_LABEL: Record<string, string> = {
  morning: "🌅 Morning",
  afternoon: "☀️ Afternoon",
  night: "🌙 Night",
};

function formatIssuedDate(isoDate: string): string {
  // "2026-09-25" → "25 Sep 2026"
  try {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

/** Unique timing slots across all medicines in the prescription. */
function summariseTimings(prescription: Prescription): string[] {
  const seen = new Set<string>();
  prescription.medicines.forEach((m) => m.timing.forEach((t) => seen.add(t)));
  return (["morning", "afternoon", "night"] as const).filter((t) =>
    seen.has(t),
  );
}

export function PrescriptionCard({ prescription, index = 0, onPress }: Props) {
  const { theme } = useTheme();
  const timings = summariseTimings(prescription);
  const medicineCount = prescription.medicines.length;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 6) * 60).springify()}
    >
      <Pressable
        onPress={() => onPress(prescription.id)}
        accessibilityRole="button"
        accessibilityLabel={`Prescription from ${prescription.doctorName}, ${formatIssuedDate(prescription.issuedAt)}`}
        hitSlop={theme.accessibility.hitSlop}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed
              ? theme.colors.background
              : theme.colors.surface,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.textSecondary + "1A",
          },
        ]}
      >
        {/* ── Top row: doctor + date ─────────────────────────────── */}
        <View style={styles.topRow}>
          <View style={styles.flex}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.typography.sizes.lg,
                fontWeight: "800",
                lineHeight: 26,
              }}
              numberOfLines={1}
            >
              {prescription.doctorName}
            </Text>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.sm,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {prescription.clinicName}
            </Text>
          </View>
          <View
            style={[
              styles.dateBadge,
              {
                backgroundColor: theme.colors.primary + "12",
                borderRadius: 8,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 4,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: theme.typography.sizes.xs,
                fontWeight: "700",
              }}
            >
              {formatIssuedDate(prescription.issuedAt)}
            </Text>
          </View>
        </View>

        {/* ── Diagnosis ─────────────────────────────────────────── */}
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.md,
            fontWeight: "600",
            marginTop: theme.spacing.sm,
          }}
          numberOfLines={2}
        >
          {prescription.diagnosis}
        </Text>

        {/* ── Divider ───────────────────────────────────────────── */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.colors.textSecondary + "22",
            marginVertical: theme.spacing.md,
          }}
        />

        {/* ── Footer: med count + timing chips ──────────────────── */}
        <View style={styles.footer}>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.sm,
              fontWeight: "600",
            }}
          >
            {medicineCount} medicine{medicineCount !== 1 ? "s" : ""}
          </Text>
          <View style={[styles.chipsRow, { gap: theme.spacing.xs }]}>
            {timings.map((t) => (
              <View
                key={t}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.colors.accent + "15",
                    borderRadius: 999,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 3,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontSize: theme.typography.sizes.xs,
                    fontWeight: "700",
                  }}
                >
                  {TIMING_LABEL[t] ?? t}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  dateBadge: {
    alignSelf: "flex-start",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {},
});
