import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { resolveGradientColors, resolveThemeColor } from "@/core/theme/resolveColor";
import { useTheme } from "@/core/theme/useTheme";
import type { SectionBackground as SectionBackgroundConfig } from "@/types/config";

type Props = {
  background?: SectionBackgroundConfig;
  children: ReactNode;
};

export function SectionBackground({ background, children }: Props) {
  const { theme } = useTheme();

  if (!background) {
    return (
      <View
        style={[
          styles.base,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {children}
      </View>
    );
  }

  if (background.mode === "solid") {
    return (
      <View
        style={[
          styles.base,
          {
            backgroundColor: resolveThemeColor(
              theme,
              background.color,
              "background",
            ),
          },
        ]}
      >
        {children}
      </View>
    );
  }

  if (background.mode === "gradient") {
    return (
      <LinearGradient
        colors={resolveGradientColors(theme, background.colors)}
        start={background.start ?? { x: 0, y: 0 }}
        end={background.end ?? { x: 1, y: 1 }}
        style={styles.base}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={styles.base}>
      <Image
        source={{ uri: background.uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      {background.overlay ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: resolveThemeColor(
                theme,
                background.overlay,
                "secondary",
              ),
              opacity: 0.55,
            },
          ]}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    width: "100%",
  },
});
