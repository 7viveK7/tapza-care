import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import type { HomeSection } from "@/types/config";

type Props = {
  section: HomeSection;
};

export function HeroBanner({ section }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.xl,
        },
      ]}
    >
      {section.greeting ? (
        <Text
          style={[
            styles.greeting,
            {
              color: theme.colors.surface,
              fontSize: theme.typography.sizes.sm,
              marginBottom: theme.spacing.sm,
            },
          ]}
        >
          {section.greeting}
        </Text>
      ) : null}
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.surface,
            fontSize: theme.typography.sizes.xxl,
          },
        ]}
      >
        {section.title ?? ""}
      </Text>
      {section.subtitle ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.surface,
              fontSize: theme.typography.sizes.md,
              marginTop: theme.spacing.sm,
            },
          ]}
        >
          {section.subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  greeting: {
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontWeight: "800",
  },
  subtitle: {
    fontWeight: "500",
    lineHeight: 22,
  },
});
