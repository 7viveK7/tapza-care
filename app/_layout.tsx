import { Stack } from "expo-router";

import { ThemeProvider } from "@/core/theme/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
