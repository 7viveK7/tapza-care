import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import type { Medicine } from "@/types";

type Props = {
  medicine: Medicine;
  /** 1-based position in the prescription (shown as a subtle index). */
  index?: number;
};

const TIMING_META: Record<
  string,
  { label: string; icon: string; bg: string; fg: string }
> = {
  morning: { label: "Morning", icon: "🌅", bg: "#FFF7ED", fg: "#C2410C" },
  afternoon: { label: "Afternoon", icon: "☀️", bg: "#FFFBEB", fg: "#B45309" },
  night: { label: "Night", icon: "🌙", bg: "#EFF6FF", fg: "#1D4ED8" },
};

export function MedicineCard({ medicine, index = 0 }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 14,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.textSecondary + "18",
        },
      ]}
    >
      {/* ── Index + Name row ─────────────────────────────────────── */}
      <View style={styles.nameRow}>
        {/* Index bubble */}
        <View
          style={[
            styles.indexBubble,
            {
              backgroundColor: theme.colors.primary + "18",
              width: 28,
              height: 28,
              borderRadius: 14,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.typography.sizes.xs,
              fontWeight: "800",
            }}
          >
            {index}
          </Text>
        </View>

        <View style={styles.flex}>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.md,
              fontWeight: "800",
              lineHeight: 22,
            }}
          >
            {medicine.name}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.sm,
              marginTop: 2,
            }}
          >
            {medicine.dose}
          </Text>
        </View>

        {/* Duration badge */}
        <View
          style={[
            styles.durationBadge,
            {
              backgroundColor: theme.colors.secondary + "15",
              borderRadius: 8,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 4,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.secondary,
              fontSize: theme.typography.sizes.xs,
              fontWeight: "700",
            }}
          >
            {medicine.days}d
          </Text>
        </View>
      </View>

      {/* ── Timing chips ─────────────────────────────────────────── */}
      <View
        style={[
          styles.timingRow,
          { marginTop: theme.spacing.sm, gap: theme.spacing.xs },
        ]}
      >
        {(["morning", "afternoon", "night"] as const)
          .filter((t) => medicine.timing.includes(t))
          .map((t) => {
            const meta = TIMING_META[t]!;
            return (
              <View
                key={t}
                style={[
                  styles.timingChip,
                  {
                    backgroundColor: meta.bg,
                    borderRadius: 999,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 3,
                  },
                ]}
              >
                <Text
                  style={{
                    color: meta.fg,
                    fontSize: theme.typography.sizes.xs,
                    fontWeight: "700",
                  }}
                >
                  {meta.icon} {meta.label}
                </Text>
              </View>
            );
          })}
      </View>

      {/* ── Instructions ─────────────────────────────────────────── */}
      {medicine.instructions ? (
        <View
          style={[
            styles.instructionsBox,
            {
              marginTop: theme.spacing.sm,
              backgroundColor: theme.colors.accent + "0D",
              borderRadius: 8,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.accent,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.sm,
              lineHeight: 20,
              fontStyle: "italic",
            }}
          >
            {medicine.instructions}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  indexBubble: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  flex: {
    flex: 1,
  },
  durationBadge: {
    alignSelf: "flex-start",
  },
  timingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timingChip: {},
  instructionsBox: {},
});
