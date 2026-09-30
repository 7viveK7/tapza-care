import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import type { HomeSection } from "@/types/config";

type Props = {
  section: HomeSection;
};

export function OfferStrip({ section }: Props) {
  const { theme } = useTheme();

  if (!section.message) {
    return null;
  }

  return (
    <View
      style={[
        styles.band,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: theme.typography.touchTargetMin,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.surface,
          fontSize: theme.typography.sizes.sm,
          fontWeight: "700",
        }}
      >
        {section.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    justifyContent: "center",
  },
});
