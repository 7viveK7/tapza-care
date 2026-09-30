import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
    type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/core/theme/useTheme";
import { ErrorState } from "@/shared/components/ErrorState";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { formatInr } from "@/shared/utils/currency";
import { formatSlotTime, toISODate } from "@/shared/utils/date";
import type { BookingResponse, Doctor, Slot } from "@/types";

import { DateStrip } from "./components/DateStrip";
import { SlotGrid } from "./components/SlotGrid";
import { SuccessAnimation } from "./components/SuccessAnimation";
import { useBookSlot } from "./hooks/useBookSlot";
import { useSlots } from "./hooks/useSlots";

// ---------------------------------------------------------------------------
// Public handle type — callers hold a ref<BookingSheetHandle> to open/close.
// ---------------------------------------------------------------------------
export type BookingSheetHandle = {
  open: () => void;
  close: () => void;
};

type Props = {
  doctor: Doctor;
  /** LayoutConfig.copy.slotUnavailable — passed through to the mutation. */
  conflictMessage?: string;
};

// ---------------------------------------------------------------------------
// Backdrop — renders the semi-transparent scrim behind the sheet.
// ---------------------------------------------------------------------------
function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.5}
    />
  );
}

// ---------------------------------------------------------------------------
// Skeleton row for slot loading state
// ---------------------------------------------------------------------------
function SlotSkeleton() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
      }}
    >
      {[0, 1].map((i) => (
        <View key={i} style={{ marginTop: theme.spacing.md }}>
          <View
            style={{
              height: 14,
              width: 80,
              borderRadius: 6,
              backgroundColor: theme.colors.textSecondary + "22",
              marginBottom: theme.spacing.sm,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.sm,
              flexWrap: "wrap",
            }}
          >
            {[0, 1, 2, 3].map((j) => (
              <View
                key={j}
                style={{
                  height: theme.typography.touchTargetMin,
                  width: 86,
                  borderRadius: 10,
                  backgroundColor: theme.colors.textSecondary + "18",
                }}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// BookingSheet
// ---------------------------------------------------------------------------
export const BookingSheet = forwardRef<BookingSheetHandle, Props>(
  function BookingSheet({ doctor, conflictMessage }, ref) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { confirmFeedback, successFeedback, snapFeedback } = useHaptics();

    // --- Date state: default to today ------------------------------------
    const [selectedDate, setSelectedDate] = useState<string>(() =>
      toISODate(new Date()),
    );
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

    // --- Confirmed booking state -----------------------------------------
    const [confirmedBooking, setConfirmedBooking] =
      useState<BookingResponse | null>(null);

    // --- Bottom sheet ref & snap points ----------------------------------
    const sheetRef = useRef<BottomSheetModal>(null);
    // Two snap points: half-height for initial, near-full for expanded
    const snapPoints = useMemo(() => ["52%", "92%"], []);

    // Expose open/close to parent via ref
    useImperativeHandle(ref, () => ({
      open: () => {
        sheetRef.current?.present();
      },
      close: () => {
        sheetRef.current?.dismiss();
      },
    }));

    // --- Data hooks -------------------------------------------------------
    const {
      data: slots,
      isPending: slotsLoading,
      isError: slotsError,
      refetch: refetchSlots,
    } = useSlots(doctor.id, selectedDate);

    const { mutate: bookSlot, isPending: isBooking } = useBookSlot(
      (booking) => {
        successFeedback();
        setConfirmedBooking(booking);
      },
    );

    // --- Handlers ---------------------------------------------------------
    const handleDateChange = useCallback((isoDate: string) => {
      setSelectedDate(isoDate);
      setSelectedSlotId(null); // clear slot selection when date changes
    }, []);

    const handleSlotSelect = useCallback((slotId: string) => {
      setSelectedSlotId(slotId);
    }, []);

    const handleConfirm = useCallback(() => {
      if (!selectedSlotId || isBooking) return;
      confirmFeedback();
      bookSlot({
        payload: { doctorId: doctor.id, slotId: selectedSlotId },
        date: selectedDate,
        conflictMessage,
      });
    }, [
      selectedSlotId,
      isBooking,
      confirmFeedback,
      bookSlot,
      doctor.id,
      selectedDate,
      conflictMessage,
    ]);

    const handleSheetChange = useCallback(
      (index: number) => {
        if (index >= 0) snapFeedback();
      },
      [snapFeedback],
    );

    const handleDismiss = useCallback(() => {
      // Reset state after the sheet is fully dismissed so re-opening is fresh.
      setTimeout(() => {
        setSelectedSlotId(null);
        setConfirmedBooking(null);
      }, 300);
    }, []);

    const handleDone = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

    // --- Derive selected slot object for display -------------------------
    const selectedSlot: Slot | undefined =
      selectedSlotId && slots
        ? slots.find((s) => s.id === selectedSlotId)
        : undefined;

    const ctaLabel = isBooking
      ? "Confirming…"
      : selectedSlot
        ? `Confirm — ${formatSlotTime(selectedSlot.startsAt)}`
        : "Select a slot";

    // --- Render -----------------------------------------------------------
    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        onDismiss={handleDismiss}
        backdropComponent={Backdrop}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.textSecondary + "55",
          width: 36,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        {/* Success overlay — shown after booking confirmed */}
        {confirmedBooking ? (
          <BottomSheetScrollView
            contentContainerStyle={[
              styles.successScroll,
              { paddingBottom: insets.bottom + theme.spacing.xl },
            ]}
          >
            <SuccessAnimation
              visible
              doctorName={doctor.name}
              slotTime={
                selectedSlot ? formatSlotTime(selectedSlot.startsAt) : undefined
              }
              bookingId={confirmedBooking.id}
            />
            <Pressable
              onPress={handleDone}
              accessibilityRole="button"
              accessibilityLabel="Done"
              style={[
                styles.ctaButton,
                {
                  marginHorizontal: theme.spacing.lg,
                  minHeight: theme.typography.touchTargetMin,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 14,
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.ctaLabel,
                  {
                    color: theme.colors.surface,
                    fontSize: theme.typography.sizes.md,
                  },
                ]}
              >
                Done
              </Text>
            </Pressable>
          </BottomSheetScrollView>
        ) : (
          <>
            {/* --- Sheet header ----------------------------------------- */}
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: theme.spacing.lg,
                  paddingTop: theme.spacing.sm,
                  paddingBottom: theme.spacing.md,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.textSecondary + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.doctorName,
                  {
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.lg,
                  },
                ]}
                numberOfLines={1}
              >
                {doctor.name}
              </Text>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.sizes.sm,
                  marginTop: 2,
                }}
              >
                {doctor.specialty} · {formatInr(doctor.feeInr)}
              </Text>
            </View>

            {/* --- Scrollable content ------------------------------------ */}
            <BottomSheetScrollView
              contentContainerStyle={{
                paddingBottom: insets.bottom + 88 + theme.spacing.lg,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Date picker */}
              <View
                style={{
                  paddingTop: theme.spacing.md,
                  paddingBottom: theme.spacing.sm,
                }}
              >
                <Text
                  style={[
                    styles.sectionLabel,
                    {
                      paddingHorizontal: theme.spacing.lg,
                      marginBottom: theme.spacing.sm,
                      color: theme.colors.textPrimary,
                      fontSize: theme.typography.sizes.md,
                    },
                  ]}
                >
                  Select Date
                </Text>
                <DateStrip
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                />
              </View>

              {/* Divider */}
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: theme.colors.textSecondary + "22",
                  marginHorizontal: theme.spacing.lg,
                  marginVertical: theme.spacing.md,
                }}
              />

              {/* Slot section label */}
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    paddingHorizontal: theme.spacing.lg,
                    marginBottom: theme.spacing.xs,
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.sizes.md,
                  },
                ]}
              >
                Available Slots
              </Text>

              {/* Slots — loading / error / grid */}
              {slotsLoading ? (
                <SlotSkeleton />
              ) : slotsError ? (
                <ErrorState
                  message="Couldn't load slots"
                  description="Check your connection and try again."
                  retryLabel="Retry"
                  onRetry={() => void refetchSlots()}
                />
              ) : (
                <SlotGrid
                  slots={slots ?? []}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={handleSlotSelect}
                  onPickAnotherDate={() =>
                    handleDateChange(
                      toISODate(
                        new Date(new Date().setDate(new Date().getDate() + 1)),
                      ),
                    )
                  }
                />
              )}
            </BottomSheetScrollView>

            {/* --- Sticky confirm CTA ------------------------------------ */}
            <View
              style={[
                styles.ctaContainer,
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
                onPress={handleConfirm}
                disabled={!selectedSlotId || isBooking}
                accessibilityRole="button"
                accessibilityLabel={ctaLabel}
                accessibilityState={{ disabled: !selectedSlotId || isBooking }}
                style={({ pressed }) => [
                  styles.ctaButton,
                  {
                    minHeight: theme.typography.touchTargetMin,
                    borderRadius: 14,
                    backgroundColor:
                      !selectedSlotId || isBooking
                        ? theme.colors.textSecondary + "44"
                        : pressed
                          ? theme.colors.secondary
                          : theme.colors.primary,
                  },
                ]}
              >
                {isBooking ? (
                  <ActivityIndicator color={theme.colors.surface} />
                ) : (
                  <Text
                    style={[
                      styles.ctaLabel,
                      {
                        color: theme.colors.surface,
                        fontSize: theme.typography.sizes.md,
                      },
                    ]}
                  >
                    {ctaLabel}
                  </Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    gap: 0,
  },
  doctorName: {
    fontWeight: "800",
  },
  sectionLabel: {
    fontWeight: "700",
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  ctaButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  ctaLabel: {
    fontWeight: "700",
  },
  successScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
