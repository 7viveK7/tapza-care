import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { useTheme } from "@/core/theme/useTheme";
import type { HomeDoctorCard, HomeSection } from "@/types/config";

type Props = {
  section: HomeSection;
};

function isDoctor(value: unknown): value is HomeDoctorCard {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.specialty === "string" &&
    typeof record.photoUrl === "string" &&
    typeof record.feeInr === "number"
  );
}

export function DoctorCarousel({ section }: Props) {
  const { theme } = useTheme();
  const doctors = (section.items ?? []).filter(isDoctor);

  return (
    <View style={{ paddingVertical: theme.spacing.md }}>
      {section.title ? (
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.lg,
            fontWeight: "800",
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
          }}
        >
          {section.title}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        {doctors.map((doctor) => (
          <Pressable
            key={doctor.id}
            accessibilityRole="button"
            onPress={() => router.push(`/doctor/${doctor.id}`)}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                minHeight: theme.typography.touchTargetMin * 3,
              },
            ]}
          >
            <Image
              source={{ uri: doctor.photoUrl }}
              style={styles.photo}
              contentFit="cover"
            />
            <View style={{ padding: theme.spacing.sm }}>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: "800",
                }}
              >
                {doctor.name}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizes.xs,
                  marginTop: theme.spacing.xs,
                }}
              >
                {doctor.specialty}
              </Text>
              <Text
                style={{
                  color: theme.colors.accent,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: "800",
                  marginTop: theme.spacing.sm,
                }}
              >
                ₹{doctor.feeInr}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    borderRadius: 16,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 120,
  },
});
