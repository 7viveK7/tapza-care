import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import type { HomeSection } from "@/types/config";

type Props = {
  section: HomeSection;
};

/**
 * Derive a legible text color given the section background config.
 *
 * Rules:
 *  - gradient / image  → always use surface (assumed dark overlay)
 *  - solid "background" or "surface" (light tones) → use textPrimary
 *  - any other solid token (primary, secondary, accent, festival…) → use surface
 *  - no background (SectionBackground falls back to theme.colors.background) → use textPrimary
 */
function useOfferTextColor(section: HomeSection): string {
  const { theme } = useTheme();
  const bg = section.background;

  if (!bg) {
    return theme.colors.textPrimary;
  }

  if (bg.mode === "gradient" || bg.mode === "image") {
    return theme.colors.surface;
  }

  // solid mode
  const lightTokens: ReadonlySet<string> = new Set(["background", "surface"]);
  if (lightTokens.has(bg.color)) {
    return theme.colors.textPrimary;
  }

  return theme.colors.surface;
}

export function OfferStrip({ section }: Props) {
  const { theme } = useTheme();
  const textColor = useOfferTextColor(section);

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
          color: textColor,
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
