import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/core/theme/useTheme";
const DEFAULT_SKELETON_TYPES = [
  "heroBanner",
  "categoryChips",
  "quickActions",
  "serviceGrid",
  "doctorCarousel",
  "offerStrip",
];

import { HEADER_EXPANDED } from "./components/CollapsingHeader";

type Props = {
  sectionTypes?: string[];
};

function Bone({
  height,
  width,
  radius = 12,
}: {
  height: number;
  width: number | `${number}%`;
  radius?: number;
}) {
  const { theme } = useTheme();
  const pulse = useSharedValue(0.45);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [pulse]);

  return (
    <Animated.View
      style={[
        style,
        {
          height,
          width,
          borderRadius: radius,
          backgroundColor: theme.colors.surface,
        },
      ]}
    />
  );
}

function SkeletonBand({ type }: { type: string }) {
  const { theme } = useTheme();

  if (type === "heroBanner") {
    return (
      <View style={{ padding: theme.spacing.lg }}>
        <Bone height={14} width="40%" />
        <View style={{ height: theme.spacing.md }} />
        <Bone height={32} width="88%" />
        <View style={{ height: theme.spacing.sm }} />
        <Bone height={16} width="70%" />
      </View>
    );
  }

  if (type === "categoryChips") {
    return (
      <View
        style={[
          styles.row,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Bone height={theme.typography.touchTargetMin} width={96} radius={999} />
        <Bone height={theme.typography.touchTargetMin} width={88} radius={999} />
        <Bone height={theme.typography.touchTargetMin} width={110} radius={999} />
      </View>
    );
  }

  if (type === "quickActions") {
    return (
      <View
        style={[
          styles.row,
          {
            flexWrap: "wrap",
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Bone height={88} width="48%" />
        <Bone height={88} width="48%" />
        <Bone height={88} width="48%" />
        <Bone height={88} width="48%" />
      </View>
    );
  }

  if (type === "serviceGrid") {
    return (
      <View
        style={[
          styles.row,
          {
            flexWrap: "wrap",
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Bone height={140} width="31%" />
        <Bone height={140} width="31%" />
        <Bone height={140} width="31%" />
      </View>
    );
  }

  if (type === "doctorCarousel") {
    return (
      <View
        style={[
          styles.row,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Bone height={196} width={168} />
        <Bone height={196} width={168} />
      </View>
    );
  }

  if (type === "offerStrip") {
    return (
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm }}>
        <Bone height={theme.typography.touchTargetMin} width="100%" radius={8} />
      </View>
    );
  }

  return (
    <View style={{ padding: theme.spacing.lg }}>
      <Bone height={72} width="100%" />
    </View>
  );
}

export function HomeSkeleton({ sectionTypes }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const types =
    sectionTypes && sectionTypes.length > 0
      ? sectionTypes
      : DEFAULT_SKELETON_TYPES;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View
        style={{
          height: HEADER_EXPANDED,
          backgroundColor: theme.colors.primary,
          paddingHorizontal: theme.spacing.lg,
          justifyContent: "flex-end",
          paddingBottom: theme.spacing.md,
        }}
      >
        <Bone height={22} width="55%" />
        <View style={{ height: theme.spacing.sm }} />
        <Bone height={14} width="40%" />
      </View>
      {types.map((type, index) => (
        <SkeletonBand key={`${type}-${index}`} type={type} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
});
