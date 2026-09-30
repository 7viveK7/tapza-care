export interface ThemeTokens {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  festival?: string;
  spacingScale?: number;
  typeScale?: number;
}

export interface LayoutFeatures {
  festivalBanner: boolean;
  walkInSlots: boolean;
  teleconsult: boolean;
  doseReminders: boolean;
}

export interface LayoutCopy {
  greeting: string;
  bookCta: string;
  feePrefix: string;
  slotUnavailable: string;
}

export type LayoutThemeName = "normal" | "festival";

export interface LayoutConfig {
  version: string;
  themeName: LayoutThemeName;
  clinicName: string;
  region: string;
  heroTitle: string;
  heroSubtitle: string;
  tokens: ThemeTokens;
  features: LayoutFeatures;
  copy: LayoutCopy;
}

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  primary: "#0F766E",
  secondary: "#115E59",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  accent: "#0EA5E9",
  spacingScale: 1,
  typeScale: 1,
};

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  version: "1.0.0",
  themeName: "normal",
  clinicName: "Tapza Care Clinics",
  region: "Telangana & Andhra Pradesh",
  heroTitle: "Care close to home",
  heroSubtitle: "Book trusted doctors across Hyderabad and Vijayawada.",
  tokens: DEFAULT_THEME_TOKENS,
  features: {
    festivalBanner: false,
    walkInSlots: true,
    teleconsult: true,
    doseReminders: true,
  },
  copy: {
    greeting: "Namaste",
    bookCta: "Book visit",
    feePrefix: "₹",
    slotUnavailable: "This slot was just taken. Please pick another time.",
  },
};
