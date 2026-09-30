import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiClient } from "@/core/api/client";
import { useLocale } from "@/core/i18n/LocaleContext";
import { useTheme } from "@/core/theme/useTheme";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { SkeletonCard } from "@/shared/components/Skeleton";
import { t } from "@/shared/utils/i18n";
import type { Prescription } from "@/types";

import { PrescriptionCard } from "./components/PrescriptionCard";

// ─── Query hook ───────────────────────────────────────────────────────────────

export const prescriptionsQueryKey = ["prescriptions"] as const;

function usePrescriptions() {
  return useQuery({
    queryKey: prescriptionsQueryKey,
    queryFn: () => apiClient<Prescription[]>("/prescriptions"),
  });
}

// ─── Skeleton list ────────────────────────────────────────────────────────────

function PrescriptionsSkeletonList() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} lines={3} />
      ))}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PrescriptionsList() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch } = usePrescriptions();
  useLocale(); // re-render on locale change

  const handlePress = useCallback((id: string) => {
    // expo-router typed routes: /prescription/[id]
    router.push(`/prescription/${id}` as Parameters<typeof router.push>[0]);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Prescription; index: number }) => (
      <PrescriptionCard
        prescription={item}
        index={index}
        onPress={handlePress}
      />
    ),
    [handlePress],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.textSecondary + "22",
          },
        ]}
      >
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.xxl,
            fontWeight: "800",
            lineHeight: 36,
          }}
        >
          {t("prescriptions")}
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sizes.md,
            marginTop: theme.spacing.xs,
            lineHeight: 22,
          }}
        >
          {t("todaySchedule")}
        </Text>
      </View>

      {/* ── Body ──────────────────────────────────────────────────── */}
      {isPending ? (
        <View style={{ marginTop: theme.spacing.lg }}>
          <PrescriptionsSkeletonList />
        </View>
      ) : isError ? (
        <ErrorState
          message={t("errorGeneric")}
          description={t("errorNetwork")}
          onRetry={() => void refetch()}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="💊"
          message={t("emptyPrescriptions")}
          description={t("todaySchedule")}
        />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    zIndex: 10,
  },
});
