import type { ThemeTokens } from "../../types/config";
import { accessibility, spacing, typography } from "./tokens";

function scaleValue(value: number, multiplier: number): number {
  return Math.round(value * multiplier);
}

function scaleRecord<T extends Record<string, number>>(
  record: T,
  multiplier: number,
): { [K in keyof T]: number } {
  const next = {} as { [K in keyof T]: number };
  (Object.keys(record) as (keyof T)[]).forEach((key) => {
    next[key] = scaleValue(record[key], multiplier);
  });
  return next;
}

export const createTheme = (tokens: ThemeTokens) => {
  const spacingScale = tokens.spacingScale ?? 1;
  const typeScale = tokens.typeScale ?? 1;

  return {
    colors: {
      primary: tokens.primary,
      secondary: tokens.secondary,
      background: tokens.background,
      surface: tokens.surface,
      textPrimary: tokens.textPrimary,
      textSecondary: tokens.textSecondary,
      accent: tokens.accent,
      festival: tokens.festival ?? tokens.accent,
    },
    spacing: scaleRecord(spacing, spacingScale),
    typography: {
      sizes: scaleRecord(typography.sizes, typeScale),
      touchTargetMin: Math.max(
        accessibility.minTouchTargetPt,
        scaleValue(typography.touchTargetMin, typeScale),
      ),
    },
    accessibility,
  };
};

export type AppTheme = ReturnType<typeof createTheme>;
