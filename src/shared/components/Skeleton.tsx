import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/core/theme/useTheme";

type BoneProps = {
  /** Height of the skeleton bone. */
  height: number;
  /** Width — number (pts) or percentage string like "80%". */
  width: number | `${number}%`;
  /** Border radius. Defaults to 8. */
  radius?: number;
  /** Additional style overrides. */
  style?: ViewStyle;
};

/**
 * Single animated skeleton "bone".
 *
 * Pulses opacity between 0.35 and 0.8 to indicate loading.
 * Uses `theme.colors.surface` so it respects the current theme palette.
 */
export function Bone({ height, width, radius = 8, style }: BoneProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 750 }),
      -1, // infinite
      true, // reverse
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          height,
          width,
          borderRadius: radius,
          backgroundColor: theme.colors.textSecondary + "30",
        },
        style,
      ]}
    />
  );
}

type SkeletonCardProps = {
  /** Number of text-line bones to render below the title bone. Defaults to 2. */
  lines?: number;
  style?: ViewStyle;
};

/**
 * Pre-composed skeleton that resembles a `PrescriptionCard`.
 *
 * Used as the loading placeholder in the prescriptions list.
 */
export function SkeletonCard({ lines = 2, style }: SkeletonCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      {/* Title line */}
      <Bone height={18} width="65%" />
      {/* Sub-lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <Bone
          key={i}
          height={14}
          width={i === lines - 1 ? "45%" : "80%"}
          radius={6}
        />
      ))}
      {/* Badge row */}
      <View
        style={[
          styles.row,
          { gap: theme.spacing.sm, marginTop: theme.spacing.xs },
        ]}
      >
        <Bone height={28} width={72} radius={999} />
        <Bone height={28} width={56} radius={999} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
  },
});
