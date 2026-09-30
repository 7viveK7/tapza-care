import { z } from "zod";

import {
  DEFAULT_LAYOUT_CONFIG,
  type LayoutConfig,
} from "../../types/config";

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/);

const ThemeTokensSchema = z.looseObject({
  primary: hexColor,
  secondary: hexColor,
  background: hexColor,
  surface: hexColor,
  textPrimary: hexColor,
  textSecondary: hexColor,
  accent: hexColor,
  festival: hexColor.optional(),
  spacingScale: z.number().positive().optional(),
  typeScale: z.number().positive().optional(),
});

const LayoutFeaturesSchema = z.looseObject({
  festivalBanner: z.boolean(),
  walkInSlots: z.boolean(),
  teleconsult: z.boolean(),
  doseReminders: z.boolean(),
});

const LayoutCopySchema = z.looseObject({
  greeting: z.string().min(1),
  bookCta: z.string().min(1),
  feePrefix: z.string().min(1),
  slotUnavailable: z.string().min(1),
});

/**
 * Unknown keys are retained (forward-compatible remote config) and never
 * fail validation on their own. Invalid *required* fields fall back via
 * {@link parseLayoutConfig} instead of throwing.
 */
export const LayoutConfigSchema = z.looseObject({
  version: z.string().min(1),
  themeName: z.enum(["normal", "festival"]),
  clinicName: z.string().min(1),
  region: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  tokens: ThemeTokensSchema,
  features: LayoutFeaturesSchema,
  copy: LayoutCopySchema,
});

export type LayoutConfigInput = z.input<typeof LayoutConfigSchema>;

export function parseLayoutConfig(
  input: unknown,
  fallback: LayoutConfig = DEFAULT_LAYOUT_CONFIG,
): LayoutConfig {
  const result = LayoutConfigSchema.safeParse(input);
  if (!result.success) {
    console.warn(
      "[Tapza Care] Layout config failed validation; using fallback.",
      result.error.issues,
    );
    return fallback;
  }

  return result.data as LayoutConfig;
}
