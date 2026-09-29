import { ThemeTokens } from "../../types/config";
import { spacing, typography } from "./tokens";

export const createTheme = (tokens: ThemeTokens) => ({
  colors: {
    primary: tokens.primary,
    secondary: tokens.secondary,
    background: tokens.background,
    surface: tokens.surface,
    textPrimary: tokens.textPrimary,
    textSecondary: tokens.textSecondary,
    accent: tokens.accent,
    festival: tokens.festival,
  },
  spacing,
  typography,
});

export type AppTheme = ReturnType<typeof createTheme>;
