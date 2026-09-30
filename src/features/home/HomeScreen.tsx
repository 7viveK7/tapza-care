import { useLayoutEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLocale } from "@/core/i18n/LocaleContext";
import { useTheme } from "@/core/theme/useTheme";
import { t } from "@/shared/utils/i18n";
import type { HomeSection } from "@/types/config";

import {
  CollapsingHeader,
  HEADER_EXPANDED,
} from "./components/CollapsingHeader";
import { SectionRenderer } from "./components/SectionRenderer";
import { HomeSkeleton } from "./HomeSkeleton";
import { LayoutConfigProvider } from "./LayoutConfigContext";
import { useLayoutConfig } from "./useLayoutConfig";

export function HomeScreen() {
  const { theme, updateThemeTokens } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const { data, isPending, isError, refetch, isRefetching } = useLayoutConfig();
  useLocale(); // re-render on locale change

  useLayoutEffect(() => {
    if (data?.tokens) {
      updateThemeTokens(data.tokens);
    }
  }, [data, updateThemeTokens]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (isPending) {
    return <HomeSkeleton />;
  }

  if (isError || !data) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: theme.colors.background,
            padding: theme.spacing.lg,
          },
        ]}
      >
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.lg,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          {t("errorGeneric")}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void refetch();
          }}
          style={{
            marginTop: theme.spacing.lg,
            minHeight: theme.typography.touchTargetMin,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primary,
          }}
        >
          <Text
            style={{
              color: theme.colors.surface,
              fontWeight: "700",
              fontSize: theme.typography.sizes.md,
            }}
          >
            {isRefetching ? t("loading") : t("retry")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const headerOffset = insets.top + HEADER_EXPANDED;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <CollapsingHeader
        title={data.clinicName}
        subtitle={data.region}
        scrollY={scrollY}
      />
      <LayoutConfigProvider config={data}>
        <Animated.FlatList
          data={data.sections}
          keyExtractor={(item: HomeSection) => item.id}
          renderItem={({ item, index }) => (
            <SectionRenderer section={item} index={index} />
          )}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: headerOffset,
            paddingBottom: insets.bottom + theme.spacing.xl,
          }}
        />
      </LayoutConfigProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
