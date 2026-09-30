import { QueryProvider } from "@/core/query/QueryProvider";
import { ThemeProvider } from "@/core/theme/ThemeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </QueryProvider>
  );
}
