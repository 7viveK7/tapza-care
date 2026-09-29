import { createContext, ReactNode, useContext, useState } from "react";
import { ThemeTokens } from "../../types/config";
import { AppTheme, createTheme } from "./createTheme";

const defaultTokens: ThemeTokens = {
  primary: "#0052CC",
  secondary: "#0747A6",
  background: "#F4F5F7",
  surface: "#FFFFFF",
  textPrimary: "#172B4D",
  textSecondary: "#5E6C84",
  accent: "#00875A",
};

const ThemeContext = createContext<{
  theme: AppTheme;
  updateThemeTokens: (tokens: ThemeTokens) => void;
}>({
  theme: createTheme(defaultTokens),
  updateThemeTokens: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, setTokens] = useState<ThemeTokens>(defaultTokens);
  const theme = createTheme(tokens);

  return (
    <ThemeContext.Provider value={{ theme, updateThemeTokens: setTokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
