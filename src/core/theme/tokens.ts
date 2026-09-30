export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  /** Apple HIG / WCAG-aligned minimum interactive size (points). */
  touchTargetMin: 44,
} as const;

export const accessibility = {
  minTouchTargetPt: 44,
  minContrastRatio: 4.5,
  hitSlop: { top: 8, right: 8, bottom: 8, left: 8 } as const,
} as const;

export type SpacingToken = keyof typeof spacing;
export type TypeSizeToken = keyof typeof typography.sizes;
