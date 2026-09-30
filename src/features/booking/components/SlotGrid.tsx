import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/core/theme/useTheme";
import { EmptyState } from "@/shared/components/EmptyState";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { formatSlotTime, getSlotPeriod } from "@/shared/utils/date";
import type { Slot } from "@/types";

type Props = {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  /** Called when user wants to pick a different date because no slots exist. */
  onPickAnotherDate?: () => void;
};

type SlotGroups = {
  morning: Slot[];
  evening: Slot[];
};

function groupSlots(slots: Slot[]): SlotGroups {
  return slots.reduce<SlotGroups>(
    (acc, slot) => {
      const period = getSlotPeriod(slot.startsAt);
      acc[period].push(slot);
      return acc;
    },
    { morning: [], evening: [] },
  );
}

function SlotChip({
  slot,
  isSelected,
  onPress,
}: {
  slot: Slot;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const isUnavailable = !slot.available;

  return (
    <Pressable
      onPress={isUnavailable ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={`${formatSlotTime(slot.startsAt)}${isUnavailable ? ", unavailable" : ""}`}
      accessibilityState={{ selected: isSelected, disabled: isUnavailable }}
      hitSlop={theme.accessibility.hitSlop}
      style={[
        styles.slotChip,
        {
          minHeight: theme.typography.touchTargetMin,
          minWidth: 86,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: isSelected
            ? theme.colors.primary
            : isUnavailable
              ? theme.colors.textSecondary + "44"
              : theme.colors.accent + "66",
          backgroundColor: isSelected
            ? theme.colors.primary
            : isUnavailable
              ? theme.colors.surface
              : theme.colors.surface,
          opacity: isUnavailable ? 0.45 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.slotTime,
          {
            fontSize: theme.typography.sizes.sm,
            color: isSelected
              ? theme.colors.surface
              : isUnavailable
                ? theme.colors.textSecondary
                : theme.colors.textPrimary,
          },
        ]}
      >
        {formatSlotTime(slot.startsAt)}
      </Text>
      {isUnavailable ? (
        <Text
          style={[
            styles.bookedLabel,
            {
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.textSecondary,
            },
          ]}
        >
          Booked
        </Text>
      ) : null}
    </Pressable>
  );
}

function PeriodSection({
  label,
  icon,
  slots,
  selectedSlotId,
  onSelectSlot,
  index,
}: {
  label: string;
  icon: string;
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  index: number;
}) {
  const { theme } = useTheme();

  if (slots.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={{ marginTop: theme.spacing.md }}
    >
      {/* Section header */}
      <View style={styles.periodHeader}>
        <Text style={styles.periodIcon} accessibilityElementsHidden>
          {icon}
        </Text>
        <Text
          style={[
            styles.periodLabel,
            {
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.textSecondary,
              marginLeft: theme.spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      </View>

      {/* Chips grid */}
      <View
        style={[
          styles.chipsRow,
          { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
        ]}
      >
        {slots.map((slot) => (
          <SlotChip
            key={slot.id}
            slot={slot}
            isSelected={selectedSlotId === slot.id}
            onPress={() => onSelectSlot(slot.id)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

export function SlotGrid({
  slots,
  selectedSlotId,
  onSelectSlot,
  onPickAnotherDate,
}: Props) {
  const { theme } = useTheme();
  const { selectionFeedback } = useHaptics();

  const groups = groupSlots(slots);
  const hasAnySlot = groups.morning.length > 0 || groups.evening.length > 0;

  if (!hasAnySlot) {
    return (
      <EmptyState
        icon="🗓"
        message="No slots available"
        description="All slots are taken for this day. Try picking another date."
        actionLabel={onPickAnotherDate ? "Pick another date" : undefined}
        onAction={onPickAnotherDate}
      />
    );
  }

  const handleSelect = (slotId: string) => {
    selectionFeedback();
    onSelectSlot(slotId);
  };

  return (
    <View style={{ paddingHorizontal: theme.spacing.lg }}>
      <PeriodSection
        label="Morning"
        icon="🌅"
        slots={groups.morning}
        selectedSlotId={selectedSlotId}
        onSelectSlot={handleSelect}
        index={0}
      />
      <PeriodSection
        label="Evening"
        icon="🌆"
        slots={groups.evening}
        selectedSlotId={selectedSlotId}
        onSelectSlot={handleSelect}
        index={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodIcon: {
    fontSize: 14,
  },
  periodLabel: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  slotChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  slotTime: {
    fontWeight: "700",
  },
  bookedLabel: {
    fontWeight: "500",
    marginTop: 1,
  },
});
