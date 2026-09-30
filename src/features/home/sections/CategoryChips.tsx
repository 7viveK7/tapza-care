import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import type { HomeCategoryChip, HomeSection } from "@/types/config";

type Props = {
  section: HomeSection;
};

function isChip(value: unknown): value is HomeCategoryChip {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.label === "string";
}

export function CategoryChips({ section }: Props) {
  const { theme } = useTheme();
  const items = (section.items ?? []).filter(isChip);

  return (
    <View style={{ paddingVertical: theme.spacing.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        {items.map((chip) => (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            hitSlop={theme.accessibility.hitSlop}
            style={[
              styles.chip,
              {
                minHeight: theme.typography.touchTargetMin,
                paddingHorizontal: theme.spacing.md,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.accent,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: theme.typography.sizes.sm,
                fontWeight: "700",
              }}
            >
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
});
