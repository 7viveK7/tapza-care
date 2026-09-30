import { QueryProvider } from "@/core/query/QueryProvider";
import { ThemeProvider } from "@/core/theme/ThemeContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryProvider>
        <ThemeProvider>
          {/* BottomSheetModalProvider manages the portal layer for BottomSheetModal */}
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="doctor/[id]"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen name="prescription/[id]" />
            </Stack>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
