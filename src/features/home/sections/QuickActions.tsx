import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import type { HomeQuickAction, HomeSection } from "@/types/config";

type Props = {
  section: HomeSection;
};

function isAction(value: unknown): value is HomeQuickAction {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.label === "string" &&
    typeof record.icon === "string" &&
    typeof record.href === "string"
  );
}

export function QuickActions({ section }: Props) {
  const { theme } = useTheme();
  const items = (section.items ?? []).filter(isAction);

  return (
    <View
      style={[
        styles.grid,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      {items.map((action) => (
        <Pressable
          key={action.id}
          accessibilityRole="button"
          onPress={() => router.push(action.href as Href)}
          style={[
            styles.tile,
            {
              minHeight: theme.typography.touchTargetMin * 2,
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.md,
            },
          ]}
        >
          <Text style={{ fontSize: theme.typography.sizes.xl }}>
            {action.icon}
          </Text>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.sm,
              fontWeight: "700",
              marginTop: theme.spacing.sm,
            }}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tile: {
    width: "48%",
    flexGrow: 1,
    borderRadius: 16,
    justifyContent: "center",
  },
});
