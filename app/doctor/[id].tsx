import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiClient } from "@/core/api/client";
import { useTheme } from "@/core/theme/useTheme";
import { ErrorState } from "@/shared/components/ErrorState";
import { formatInr } from "@/shared/utils/currency";
import type { Doctor } from "@/types";

import {
    BookingSheet,
    type BookingSheetHandle,
} from "@/features/booking/BookingSheet";

// ---------------------------------------------------------------------------
// Fetch hook — resolves a single Doctor by id from GET /doctors.
// GET /doctors returns the full array; we find by id client-side since the
// mock API has no GET /doctors/:id route.
// ---------------------------------------------------------------------------
function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const doctors = await apiClient<Doctor[]>("/doctors");
      const found = doctors.find((d) => d.id === id);
      if (!found) throw new Error(`Doctor ${id} not found`);
      return found;
    },
    enabled: id.length > 0,
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Skeleton — shown while doctor data loads
// ---------------------------------------------------------------------------
function DoctorDetailSkeleton() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const Bone = ({
    h,
    w,
    radius = 8,
    mt = 0,
  }: {
    h: number;
    w: number | `${number}%`;
    radius?: number;
    mt?: number;
  }) => (
    <View
      style={{
        height: h,
        width: w,
        borderRadius: radius,
        backgroundColor: theme.colors.textSecondary + "22",
        marginTop: mt,
      }}
    />
  );

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Photo placeholder */}
      <View
        style={{
          height: PHOTO_HEIGHT,
          backgroundColor: theme.colors.textSecondary + "18",
        }}
      />
      <View
        style={{
          padding: theme.spacing.lg,
          gap: theme.spacing.sm,
        }}
      >
        <Bone h={28} w="70%" />
        <Bone h={16} w="50%" mt={4} />
        <Bone h={16} w="40%" mt={4} />
        <Bone h={48} w="100%" radius={14} mt={theme.spacing.lg} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Stat pill — used for rating, experience, city
// ---------------------------------------------------------------------------
function StatPill({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.statPill,
        {
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.textSecondary + "22",
        },
      ]}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontSize: theme.typography.sizes.sm,
          fontWeight: "700",
          marginTop: 2,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.sizes.xs,
          marginTop: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function DoctorDetailsScreen() {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BookingSheetHandle>(null);

  const { data: doctor, isPending, isError, refetch } = useDoctor(id);

  // --- Loading ---
  if (isPending) {
    return <DoctorDetailSkeleton />;
  }

  // --- Error ---
  if (isError || !doctor) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Back button even on error */}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={theme.accessibility.hitSlop}
          style={[
            styles.backButton,
            {
              top: insets.top + theme.spacing.sm,
              left: theme.spacing.md,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              color: theme.colors.textPrimary,
            }}
          >
            ←
          </Text>
        </Pressable>
        <ErrorState
          message="Doctor profile unavailable"
          description="We couldn't load this doctor's details. Please try again."
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  // --- Render detail ---
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 96,
        }}
      >
        {/* ---- Photo banner -------------------------------------------- */}
        <View style={{ height: PHOTO_HEIGHT }}>
          <Image
            source={{ uri: doctor.photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel={`Photo of ${doctor.name}`}
          />
          {/* Gradient scrim so back button is always readable */}
          <View
            style={[StyleSheet.absoluteFill, styles.photoScrim]}
            pointerEvents="none"
          />
        </View>

        {/* ---- Back button --------------------------------------------- */}
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={theme.accessibility.hitSlop}
          style={[
            styles.backButton,
            {
              top: insets.top + theme.spacing.sm,
              left: theme.spacing.md,
              backgroundColor: theme.colors.surface + "CC",
            },
          ]}
        >
          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              color: theme.colors.textPrimary,
            }}
          >
            ←
          </Text>
        </Pressable>

        {/* ---- Main card ------------------------------------------------ */}
        <View
          style={[
            styles.card,
            {
              marginHorizontal: theme.spacing.md,
              marginTop: -CARD_OVERLAP,
              backgroundColor: theme.colors.surface,
              borderRadius: 20,
              padding: theme.spacing.lg,
            },
          ]}
        >
          {/* Name + specialty */}
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.xl,
              fontWeight: "800",
            }}
          >
            {doctor.name}
          </Text>
          <Text
            style={{
              color: theme.colors.accent,
              fontSize: theme.typography.sizes.md,
              fontWeight: "600",
              marginTop: theme.spacing.xs,
            }}
          >
            {doctor.specialty}
          </Text>

          {/* Clinic + city */}
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.sm,
              marginTop: theme.spacing.xs,
            }}
          >
            📍 {doctor.clinicName}, {doctor.city}
          </Text>

          {/* Stats row */}
          <View
            style={[
              styles.statsRow,
              { marginTop: theme.spacing.lg, gap: theme.spacing.sm },
            ]}
          >
            <StatPill
              icon="⭐"
              value={doctor.rating.toFixed(1)}
              label="Rating"
            />
            <StatPill
              icon="🏥"
              value={`${doctor.experienceYears} yrs`}
              label="Experience"
            />
            <StatPill icon="💰" value={formatInr(doctor.feeInr)} label="Fee" />
          </View>

          {/* Languages */}
          <View
            style={{
              marginTop: theme.spacing.lg,
            }}
          >
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.xs,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: theme.spacing.sm,
              }}
            >
              Languages
            </Text>
            <View style={[styles.chipsRow, { gap: theme.spacing.xs }]}>
              {doctor.languages.map((lang) => (
                <View
                  key={lang}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: theme.colors.primary + "18",
                      borderRadius: 999,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.xs,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontSize: theme.typography.sizes.xs,
                      fontWeight: "700",
                    }}
                  >
                    {lang}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ---- About section ------------------------------------------- */}
        <View
          style={{
            marginHorizontal: theme.spacing.md,
            marginTop: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: theme.spacing.lg,
          }}
        >
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.typography.sizes.md,
              fontWeight: "800",
              marginBottom: theme.spacing.sm,
            }}
          >
            About
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sizes.sm,
              lineHeight: 22,
            }}
          >
            {doctor.name} is a {doctor.specialty.toLowerCase()} at{" "}
            {doctor.clinicName} in {doctor.city}, with over{" "}
            {doctor.experienceYears} years of clinical experience. Consultations
            available in {doctor.languages.join(", ")}.
          </Text>
        </View>
      </ScrollView>

      {/* ---- Sticky Book button ---------------------------------------- */}
      <View
        style={[
          styles.stickyFooter,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: insets.bottom + theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.colors.textSecondary + "22",
          },
        ]}
      >
        <Pressable
          onPress={() => sheetRef.current?.open()}
          accessibilityRole="button"
          accessibilityLabel={`Book appointment with ${doctor.name}`}
          style={({ pressed }) => [
            styles.bookButton,
            {
              minHeight: theme.typography.touchTargetMin,
              borderRadius: 14,
              backgroundColor: pressed
                ? theme.colors.secondary
                : theme.colors.primary,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.surface,
              fontSize: theme.typography.sizes.md,
              fontWeight: "700",
            }}
          >
            Book Appointment · {formatInr(doctor.feeInr)}
          </Text>
        </Pressable>
      </View>

      {/* ---- Booking bottom sheet -------------------------------------- */}
      <BookingSheet ref={sheetRef} doctor={doctor} />
    </View>
  );
}

const PHOTO_HEIGHT = 280;
const CARD_OVERLAP = 32;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  photoScrim: {
    // Top-to-transparent gradient effect using a solid with low opacity
    // (expo-linear-gradient isn't needed here — the photo provides context)
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  backButton: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  card: {
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 3,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statPill: {
    alignItems: "center",
    minWidth: 72,
  },
  statIcon: {
    fontSize: 18,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  langChip: {
    // Pill shape handled by borderRadius at call site
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bookButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
