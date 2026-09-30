import { z } from "zod";

import {
  DEFAULT_LAYOUT_CONFIG,
  type LayoutConfig,
} from "../../types/config";

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/);

const ThemeColorTokenSchema = z.enum([
  "primary",
  "secondary",
  "background",
  "surface",
  "textPrimary",
  "textSecondary",
  "accent",
  "festival",
]);

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

const GradientPointSchema = z.looseObject({
  x: z.number(),
  y: z.number(),
});

const SectionBackgroundSchema = z.union([
  z.looseObject({
    mode: z.literal("solid"),
    color: ThemeColorTokenSchema,
  }),
  z.looseObject({
    mode: z.literal("gradient"),
    colors: z.array(ThemeColorTokenSchema).min(1),
    start: GradientPointSchema.optional(),
    end: GradientPointSchema.optional(),
  }),
  z.looseObject({
    mode: z.literal("image"),
    uri: z.string().min(1),
    overlay: ThemeColorTokenSchema.optional(),
  }),
]);

const HomeSectionSchema = z.looseObject({
  id: z.string().min(1),
  type: z.string().min(1),
  background: SectionBackgroundSchema.optional(),
  greeting: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  message: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
  items: z.array(z.looseObject({})).optional(),
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
  sections: z.array(HomeSectionSchema).optional().default([]),
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
