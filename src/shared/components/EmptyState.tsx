import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";

type Props = {
  /** Primary heading. */
  message?: string;
  /** Supporting description shown below the heading. */
  description?: string;
  /** Optional emoji / icon character rendered large above the message. */
  icon?: string;
  /** Optional action label + callback, e.g. "Pick another date". */
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  message = "Nothing here yet",
  description,
  icon = "🗓",
  actionLabel,
  onAction,
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
      {icon ? (
        <Text style={styles.icon} accessibilityElementsHidden>
          {icon}
        </Text>
      ) : null}

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

      {description ? (
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
      ) : null}

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={theme.accessibility.hitSlop}
          style={({ pressed }) => [
            styles.actionButton,
            {
              marginTop: theme.spacing.lg,
              minHeight: theme.typography.touchTargetMin,
              paddingHorizontal: theme.spacing.xl,
              borderWidth: 1.5,
              borderColor: theme.colors.primary,
              backgroundColor: pressed ? theme.colors.primary : "transparent",
            },
          ]}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.actionLabel,
                {
                  color: pressed ? theme.colors.surface : theme.colors.primary,
                  fontSize: theme.typography.sizes.md,
                },
              ]}
            >
              {actionLabel}
            </Text>
          )}
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
    fontSize: 44,
  },
  message: {
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontWeight: "700",
  },
});
