import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";

type Props = {
  /** Primary message shown in larger text. */
  message?: string;
  /** Secondary description shown below the message. */
  description?: string;
  /** Label for the retry button. Defaults to "Try again". */
  retryLabel?: string;
  /** Called when the user presses the retry button. */
  onRetry?: () => void;
};

export function ErrorState({
  message = "Something went wrong",
  description = "We couldn't load this content. Please check your connection and try again.",
  retryLabel = "Try again",
  onRetry,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {/* Icon — no icon library dependency, use a simple emoji */}
      <Text style={styles.icon} accessibilityElementsHidden>
        ⚠️
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.lg,
            marginTop: theme.spacing.md,
          },
        ]}
      >
        {message}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sizes.sm,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        {description}
      </Text>

      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          hitSlop={theme.accessibility.hitSlop}
          style={({ pressed }) => [
            styles.retryButton,
            {
              marginTop: theme.spacing.lg,
              minHeight: theme.typography.touchTargetMin,
              paddingHorizontal: theme.spacing.xl,
              backgroundColor: pressed
                ? theme.colors.secondary
                : theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.retryLabel,
              {
                color: theme.colors.surface,
                fontSize: theme.typography.sizes.md,
              },
            ]}
          >
            {retryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 40,
  },
  message: {
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  retryLabel: {
    fontWeight: "700",
  },
});
