import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
    type SharedValue,
} from "react-native-reanimated";

import { useTheme } from "@/core/theme/useTheme";

type Props = {
  /** Triggers the entrance animation when it transitions from false → true. */
  visible: boolean;
  /** Doctor name shown in the confirmation message. */
  doctorName?: string;
  /** Formatted slot time shown in the confirmation message. */
  slotTime?: string;
  /** Booking reference ID. */
  bookingId?: string;
};

const ICON_SIZE = 88;

/**
 * Pure Reanimated checkmark badge — no SVG or Lottie dependency.
 *
 * Built from two animated Views:
 *   - A filled circle (the "badge" background)
 *   - Two rectangular bars rotated and positioned to form a ✓ shape
 */
function CheckmarkBadge({
  color,
  scale,
}: {
  color: string;
  scale: SharedValue<number>;
}) {
  const { theme } = useTheme();
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.badge,
        badgeStyle,
        {
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: ICON_SIZE / 2,
          backgroundColor: color,
        },
      ]}
    >
      {/* Short arm of the tick — bottom-left segment */}
      <View
        style={[
          styles.tickShort,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      />
      {/* Long arm of the tick — right-upward segment */}
      <View
        style={[
          styles.tickLong,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      />
    </Animated.View>
  );
}

export function SuccessAnimation({
  visible,
  doctorName,
  slotTime,
  bookingId,
}: Props) {
  const { theme } = useTheme();

  // --- Shared values -------------------------------------------------------
  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(16);
  const textOpacity = useSharedValue(0);

  // --- Trigger animation when visible becomes true -------------------------
  useEffect(() => {
    if (!visible) {
      containerScale.value = 0;
      containerOpacity.value = 0;
      iconScale.value = 0;
      iconOpacity.value = 0;
      textTranslateY.value = 16;
      textOpacity.value = 0;
      return;
    }

    // 1. Fade in + scale up the container
    containerOpacity.value = withTiming(1, { duration: 200 });
    containerScale.value = withSpring(1, { damping: 14, stiffness: 120 });

    // 2. Pop the badge in with overshoot spring
    iconOpacity.value = withDelay(150, withTiming(1, { duration: 100 }));
    iconScale.value = withDelay(
      150,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      ),
    );

    // 3. Slide-up the confirmation text
    textOpacity.value = withDelay(
      350,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
    );
    textTranslateY.value = withDelay(
      350,
      withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
    );
  }, [
    visible,
    containerOpacity,
    containerScale,
    iconOpacity,
    iconScale,
    textOpacity,
    textTranslateY,
  ]);

  // --- Animated styles -----------------------------------------------------
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.root, containerStyle]}
      accessibilityLiveRegion="polite"
      accessibilityLabel="Booking confirmed"
    >
      {/* Checkmark badge */}
      <CheckmarkBadge color={theme.colors.primary} scale={iconScale} />

      {/* Confirmation text */}
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text
          style={[
            styles.heading,
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.xl,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          Booking Confirmed!
        </Text>

        {doctorName ? (
          <Text
            style={[
              styles.sub,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.md,
                marginTop: theme.spacing.sm,
              },
            ]}
          >
            {doctorName}
          </Text>
        ) : null}

        {slotTime ? (
          <View
            style={[
              styles.slotBadge,
              {
                marginTop: theme.spacing.md,
                backgroundColor: theme.colors.primary + "1A",
                borderRadius: 999,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.slotText,
                {
                  color: theme.colors.primary,
                  fontSize: theme.typography.sizes.md,
                },
              ]}
            >
              🕐 {slotTime}
            </Text>
          </View>
        ) : null}

        {bookingId ? (
          <Text
            style={[
              styles.bookingId,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.xs,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            Ref: {bookingId}
          </Text>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // Short arm: bottom-left part of the ✓, ~24px long at ~45° pointing down-right
  tickShort: {
    position: "absolute",
    width: 4,
    height: 18,
    borderRadius: 2,
    bottom: 22,
    left: 28,
    transform: [{ rotate: "45deg" }],
  },
  // Long arm: top-right part of the ✓, ~38px long at ~-45° pointing up-right
  tickLong: {
    position: "absolute",
    width: 4,
    height: 32,
    borderRadius: 2,
    bottom: 26,
    left: 40,
    transform: [{ rotate: "-45deg" }],
  },
  textBlock: {
    alignItems: "center",
  },
  heading: {
    fontWeight: "800",
    textAlign: "center",
  },
  sub: {
    fontWeight: "600",
    textAlign: "center",
  },
  slotBadge: {
    alignItems: "center",
  },
  slotText: {
    fontWeight: "700",
  },
  bookingId: {
    fontWeight: "400",
    letterSpacing: 0.3,
  },
});
