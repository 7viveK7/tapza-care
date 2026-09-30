import {
  createContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_THEME_TOKENS, type ThemeTokens } from "../../types/config";
import { createTheme, type AppTheme } from "./createTheme";

export type ThemeContextValue = {
  theme: AppTheme;
  tokens: ThemeTokens;
  updateThemeTokens: (tokens: ThemeTokens) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<ThemeTokens>(DEFAULT_THEME_TOKENS);
  const theme = useMemo(() => createTheme(tokens), [tokens]);

  const value = useMemo(
    () => ({
      theme,
      tokens,
      updateThemeTokens: setTokens,
    }),
    [theme, tokens],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
