import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiClient } from "@/core/api/client";
import { useTheme } from "@/core/theme/useTheme";
import { ErrorState } from "@/shared/components/ErrorState";
import { Bone, SkeletonCard } from "@/shared/components/Skeleton";
import { toISODate } from "@/shared/utils/date";
import type { Prescription } from "@/types";

import { DoseSchedule } from "./components/DoseSchedule";
import { MedicineCard } from "./components/MedicineCard";
import { todayISODate, useDoseTracker } from "./hooks/useDoseTracker";
import { prescriptionsQueryKey } from "./PrescriptionsList";

// ─── Data hooks ───────────────────────────────────────────────────────────────

function usePrescriptionDetail(id: string) {
  return useQuery({
    queryKey: [...prescriptionsQueryKey, id],
    queryFn: async () => {
      const list = await apiClient<Prescription[]>("/prescriptions");
      const found = list.find((p) => p.id === id);
      if (!found) throw new Error(`Prescription ${id} not found`);
      return found;
    },
    enabled: id.length > 0,
    staleTime: 30_000,
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  const { theme } = useTheme();
  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header block */}
      <Bone height={28} width="70%" />
      <Bone height={16} width="55%" style={{ marginTop: theme.spacing.xs }} />
      <Bone height={14} width="40%" style={{ marginTop: 2 }} />
      {/* Diagnosis block */}
      <View
        style={{
          marginTop: theme.spacing.lg,
          gap: theme.spacing.sm,
        }}
      >
        <Bone height={14} width={72} radius={6} />
        <Bone height={20} width="80%" />
        <Bone height={16} width="60%" />
      </View>
      {/* Medicine cards */}
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </ScrollView>
  );
}

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.xs,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: theme.spacing.sm,
      }}
    >
      {label}
    </Text>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  prescriptionId: string;
};

export function PrescriptionDetailScreen({ prescriptionId }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const today = toISODate(new Date());

  const {
    data: prescription,
    isPending,
    isError,
    refetch,
  } = usePrescriptionDetail(prescriptionId);

  const { getStatus, toggle } = useDoseTracker();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isPending) {
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
        <BackButton onPress={handleBack} theme={theme} insets={insets} />
        <DetailSkeleton />
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !prescription) {
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
        <BackButton onPress={handleBack} theme={theme} insets={insets} />
        <ErrorState
          message="Prescription unavailable"
          description="We couldn't load this prescription. Please try again."
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const formattedDate = formatDate(prescription.issuedAt);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
      >
        {/* ── Hero header card ────────────────────────────────────── */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.primary,
              paddingTop: insets.top + theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
            },
          ]}
        >
          {/* Back button */}
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={theme.accessibility.hitSlop}
            style={[
              styles.backBtn,
              {
                minHeight: theme.typography.touchTargetMin,
                minWidth: theme.typography.touchTargetMin,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.surface + "CC",
                fontSize: theme.typography.sizes.lg,
              }}
            >
              ← Back
            </Text>
          </Pressable>

          {/* Doctor + clinic */}
          <Text
            style={{
              color: theme.colors.surface,
              fontSize: theme.typography.sizes.xl,
              fontWeight: "800",
              marginTop: theme.spacing.md,
              lineHeight: 30,
            }}
          >
            {prescription.doctorName}
          </Text>
          <Text
            style={{
              color: theme.colors.surface + "CC",
              fontSize: theme.typography.sizes.sm,
              marginTop: 2,
            }}
          >
            {prescription.clinicName}
          </Text>

          {/* Date + patient row */}
          <View
            style={[
              styles.metaRow,
              { marginTop: theme.spacing.md, gap: theme.spacing.md },
            ]}
          >
            <MetaPill icon="📅" label={formattedDate} />
            <MetaPill icon="👤" label={prescription.patientName} />
          </View>
        </View>

        {/* ── Curved white overlap ───────────────────────────────── */}
        <View
          style={[
            styles.bodyWrap,
            {
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              marginTop: -24,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              gap: theme.spacing.xl,
            },
          ]}
        >
          {/* ── Diagnosis ─────────────────────────────────────────── */}
          <View>
            <SectionHeading label="Diagnosis" />
            <View
              style={[
                styles.diagnosisBox,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: 14,
                  padding: theme.spacing.md,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.accent,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.sizes.lg,
                  fontWeight: "700",
                  lineHeight: 26,
                }}
              >
                {prescription.diagnosis}
              </Text>
              {prescription.notes ? (
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.sizes.sm,
                    marginTop: theme.spacing.sm,
                    lineHeight: 20,
                    fontStyle: "italic",
                  }}
                >
                  📝 {prescription.notes}
                </Text>
              ) : null}
            </View>
          </View>

          {/* ── Today's Dose Schedule ─────────────────────────────── */}
          <View>
            <SectionHeading label={`Today's schedule — ${today}`} />
            <DoseSchedule
              prescription={prescription}
              date={todayISODate()}
              getStatus={getStatus}
              toggle={toggle}
            />
          </View>

          {/* ── Full medicine list ────────────────────────────────── */}
          <View>
            <SectionHeading
              label={`Medicines — ${prescription.medicines.length} prescribed`}
            />
            <View style={{ gap: theme.spacing.sm }}>
              {prescription.medicines.map((med, i) => (
                <MedicineCard key={med.id} medicine={med} index={i + 1} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

type ThemeType = ReturnType<typeof useTheme>["theme"];

function BackButton({
  onPress,
  theme,
  insets,
}: {
  onPress: () => void;
  theme: ThemeType;
  insets: { top: number };
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={theme.accessibility.hitSlop}
      style={[
        styles.floatingBack,
        {
          top: insets.top + theme.spacing.sm,
          left: theme.spacing.md,
          minHeight: theme.typography.touchTargetMin,
          backgroundColor: theme.colors.surface,
          borderRadius: 10,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontSize: theme.typography.sizes.md,
          fontWeight: "600",
        }}
      >
        ← Back
      </Text>
    </Pressable>
  );
}

function MetaPill({ icon, label }: { icon: string; label: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.metaPill,
        {
          backgroundColor: theme.colors.surface + "22",
          borderRadius: 999,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 5,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.surface,
          fontSize: theme.typography.sizes.sm,
          fontWeight: "600",
        }}
      >
        {icon} {label}
      </Text>
    </View>
  );
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  heroCard: {},
  backBtn: {
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaPill: {},
  bodyWrap: {},
  diagnosisBox: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  floatingBack: {
    position: "absolute",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
