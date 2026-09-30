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

export type ThemeColorToken =
  | "primary"
  | "secondary"
  | "background"
  | "surface"
  | "textPrimary"
  | "textSecondary"
  | "accent"
  | "festival";

export type SectionBackground =
  | {
      mode: "solid";
      color: ThemeColorToken;
    }
  | {
      mode: "gradient";
      colors: ThemeColorToken[];
      start?: { x: number; y: number };
      end?: { x: number; y: number };
    }
  | {
      mode: "image";
      uri: string;
      overlay?: ThemeColorToken;
    };

export interface HomeCategoryChip {
  id: string;
  label: string;
}

export interface HomeQuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface HomeService {
  id: string;
  name: string;
  priceInr: number;
  imageUrl: string;
  badge?: string;
}

export interface HomeDoctorCard {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  feeInr: number;
}

export interface HomeSection {
  id: string;
  type: string;
  background?: SectionBackground;
  greeting?: string;
  title?: string;
  subtitle?: string;
  message?: string;
  columns?: 2 | 3;
  items?:
    | HomeCategoryChip[]
    | HomeQuickAction[]
    | HomeService[]
    | HomeDoctorCard[];
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
  sections: HomeSection[];
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

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  {
    id: "hero",
    type: "heroBanner",
    background: {
      mode: "gradient",
      colors: ["primary", "secondary"],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    greeting: "Namaste",
    title: "Care close to home",
    subtitle: "Book trusted doctors across Hyderabad and Vijayawada.",
  },
  {
    id: "categories",
    type: "categoryChips",
    background: { mode: "solid", color: "background" },
    items: [
      { id: "gp", label: "Physician" },
      { id: "cardio", label: "Heart" },
      { id: "child", label: "Child" },
      { id: "women", label: "Women" },
    ],
  },
  {
    id: "actions",
    type: "quickActions",
    background: { mode: "solid", color: "background" },
    items: [
      { id: "book", label: "Book", icon: "📅", href: "/(tabs)/bookings" },
      {
        id: "rx",
        label: "Prescriptions",
        icon: "💊",
        href: "/(tabs)/prescriptions",
      },
    ],
  },
];

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
  sections: DEFAULT_HOME_SECTIONS,
};
