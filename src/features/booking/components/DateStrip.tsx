import { useCallback, useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/core/theme/useTheme";
import { useHaptics } from "@/shared/hooks/useHaptics";
import {
    formatDayNumber,
    formatRelativeDay,
    getNextDays,
    toISODate,
} from "@/shared/utils/date";

/** Number of upcoming days shown in the strip. */
const DAYS_SHOWN = 14;

type Props = {
  /** Currently selected date as "YYYY-MM-DD". */
  selectedDate: string;
  /** Called when the user taps a date chip. */
  onDateChange: (isoDate: string) => void;
};

export function DateStrip({ selectedDate, onDateChange }: Props) {
  const { theme } = useTheme();
  const { selectionFeedback } = useHaptics();
  const scrollRef = useRef<ScrollView>(null);
  const today = useRef(new Date()).current;
  const dates = useRef(getNextDays(DAYS_SHOWN)).current;

  // Scroll the selected chip into view whenever selectedDate changes.
  useEffect(() => {
    const idx = dates.findIndex((d) => toISODate(d) === selectedDate);
    if (idx < 0 || !scrollRef.current) return;
    // Each chip is CHIP_WIDTH + GAP wide; offset so selected sits centered-ish.
    scrollRef.current.scrollTo({
      x: Math.max(0, idx * (CHIP_WIDTH + GAP) - 16),
      animated: true,
    });
  }, [dates, selectedDate]);

  const handlePress = useCallback(
    (isoDate: string) => {
      selectionFeedback();
      onDateChange(isoDate);
    },
    [onDateChange, selectionFeedback],
  );

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingHorizontal: theme.spacing.lg, gap: GAP },
        ]}
        decelerationRate="fast"
        snapToInterval={CHIP_WIDTH + GAP}
        snapToAlignment="start"
      >
        {dates.map((date) => {
          const isoDate = toISODate(date);
          const isSelected = isoDate === selectedDate;
          const dayLabel = formatRelativeDay(date, today);
          const dayNumber = formatDayNumber(date);

          return (
            <Pressable
              key={isoDate}
              onPress={() => handlePress(isoDate)}
              accessibilityRole="button"
              accessibilityLabel={`${dayLabel} ${dayNumber}`}
              accessibilityState={{ selected: isSelected }}
              hitSlop={theme.accessibility.hitSlop}
              style={[
                styles.chip,
                {
                  minHeight: theme.typography.touchTargetMin,
                  width: CHIP_WIDTH,
                  borderRadius: 12,
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderWidth: 1.5,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.textSecondary + "33",
                },
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  {
                    fontSize: theme.typography.sizes.xs,
                    color: isSelected
                      ? theme.colors.surface
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {dayLabel}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    fontSize: theme.typography.sizes.lg,
                    color: isSelected
                      ? theme.colors.surface
                      : theme.colors.textPrimary,
                  },
                ]}
              >
                {dayNumber}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const CHIP_WIDTH = 56;
const GAP = 8;

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    paddingVertical: 4,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    overflow: "hidden",
  },
  dayLabel: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  dayNumber: {
    fontWeight: "800",
  },
});
