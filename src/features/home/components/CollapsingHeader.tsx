import { StyleSheet, Text } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/core/theme/useTheme";

export const HEADER_EXPANDED = 96;
export const HEADER_COLLAPSED = 52;

type Props = {
  title: string;
  subtitle: string;
  scrollY: SharedValue<number>;
};

export function CollapsingHeader({ title, subtitle, scrollY }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const extra = interpolate(
      scrollY.value,
      [0, 88],
      [HEADER_EXPANDED, HEADER_COLLAPSED],
      Extrapolation.CLAMP,
    );
    return {
      height: insets.top + extra,
    };
  });

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 48], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 48],
          [0, -8],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, 88],
      [theme.typography.sizes.xl, theme.typography.sizes.md],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.header,
        containerStyle,
        {
          paddingTop: insets.top,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          backgroundColor: theme.colors.primary,
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.title,
          titleStyle,
          { color: theme.colors.surface },
        ]}
      >
        {title}
      </Animated.Text>
      <Animated.View style={subtitleStyle}>
        <Text
          style={{
            color: theme.colors.surface,
            fontSize: theme.typography.sizes.sm,
            marginTop: theme.spacing.xs,
          }}
        >
          {subtitle}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  title: {
    fontWeight: "800",
  },
});
