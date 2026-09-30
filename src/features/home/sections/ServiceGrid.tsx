import { Image } from "expo-image";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import type { HomeSection, HomeService } from "@/types/config";

type Props = {
  section: HomeSection;
};

function isService(value: unknown): value is HomeService {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.priceInr === "number" &&
    typeof record.imageUrl === "string"
  );
}

export function ServiceGrid({ section }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const columns = section.columns === 2 ? 2 : 3;
  const items = (section.items ?? []).filter(isService);
  const gutter = theme.spacing.lg;
  const gap = theme.spacing.sm;
  const cardWidth = (width - gutter * 2 - gap * (columns - 1)) / columns;

  return (
    <View
      style={{
        paddingHorizontal: gutter,
        paddingVertical: theme.spacing.md,
      }}
    >
      {section.title ? (
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.lg,
            fontWeight: "800",
            marginBottom: theme.spacing.md,
          }}
        >
          {section.title}
        </Text>
      ) : null}
      <View style={[styles.grid, { gap }]}>
        {items.map((service) => (
          <View
            key={service.id}
            style={[
              styles.card,
              {
                width: cardWidth,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Image
              source={{ uri: service.imageUrl }}
              style={styles.image}
              contentFit="cover"
            />
            {service.badge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.accent,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.surface,
                    fontSize: theme.typography.sizes.xs,
                    fontWeight: "700",
                  }}
                >
                  {service.badge}
                </Text>
              </View>
            ) : null}
            <View style={{ padding: theme.spacing.sm }}>
              <Text
                numberOfLines={2}
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: "700",
                }}
              >
                {service.name}
              </Text>
              <Text
                style={{
                  color: theme.colors.accent,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: "800",
                  marginTop: theme.spacing.xs,
                }}
              >
                ₹{service.priceInr}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 88,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 999,
  },
});
