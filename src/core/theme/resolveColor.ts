import type { AppTheme } from "./createTheme";
import type { ThemeColorToken } from "../../types/config";

const TOKEN_NAMES: ReadonlySet<string> = new Set([
  "primary",
  "secondary",
  "background",
  "surface",
  "textPrimary",
  "textSecondary",
  "accent",
  "festival",
]);

export function resolveThemeColor(
  theme: AppTheme,
  token: string | undefined,
  fallback: ThemeColorToken = "background",
): string {
  if (token && TOKEN_NAMES.has(token)) {
    return theme.colors[token as ThemeColorToken];
  }
  return theme.colors[fallback];
}

export function resolveGradientColors(
  theme: AppTheme,
  tokens: string[] | undefined,
  fallback: ThemeColorToken = "primary",
): [string, string, ...string[]] {
  const resolved = (tokens ?? []).map((token) =>
    resolveThemeColor(theme, token, fallback),
  );
  if (resolved.length >= 2) {
    return resolved as [string, string, ...string[]];
  }
  const color = resolved[0] ?? theme.colors[fallback];
  return [color, color];
}
