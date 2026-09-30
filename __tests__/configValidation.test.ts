/**
 * configValidation.test.ts
 *
 * Tests for the Zod-based LayoutConfig schema validation in
 * src/core/config/schema.ts.
 *
 * Strategy: test parseLayoutConfig() — the public entry point — rather than
 * individual sub-schemas, so the tests exercise the real behaviour callers
 * see (valid → typed object, invalid → DEFAULT_LAYOUT_CONFIG fallback).
 */

import {
    LayoutConfigSchema,
    parseLayoutConfig,
} from "../src/core/config/schema";
import {
    DEFAULT_LAYOUT_CONFIG
} from "../src/types/config";

// ─── Shared valid fixture ──────────────────────────────────────────────────────

const VALID_TOKENS = {
  primary: "#0F766E",
  secondary: "#115E59",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  accent: "#0EA5E9",
};

const VALID_PAYLOAD = {
  version: "1.0.0",
  themeName: "normal",
  clinicName: "Tapza Care Clinics",
  region: "Hyderabad & Vijayawada",
  heroTitle: "Care close to home",
  heroSubtitle: "Same-day OPD",
  tokens: VALID_TOKENS,
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
    slotUnavailable: "Slot taken.",
  },
  sections: [],
} as const;

// ─── 1. Valid payload ──────────────────────────────────────────────────────────

describe("parseLayoutConfig — valid payloads", () => {
  it("returns a typed LayoutConfig for a well-formed payload", () => {
    const result = parseLayoutConfig(VALID_PAYLOAD);
    expect(result.version).toBe("1.0.0");
    expect(result.themeName).toBe("normal");
    expect(result.clinicName).toBe("Tapza Care Clinics");
    expect(result.tokens.primary).toBe("#0F766E");
  });

  it("accepts 'festival' as a valid themeName", () => {
    const festivalPayload = { ...VALID_PAYLOAD, themeName: "festival" };
    const result = parseLayoutConfig(festivalPayload);
    expect(result.themeName).toBe("festival");
  });

  it("accepts an optional festival token colour", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, festival: "#DC2626" },
    };
    const result = parseLayoutConfig(payload);
    expect(result.tokens.festival).toBe("#DC2626");
  });

  it("defaults sections to [] when the field is omitted", () => {
    const { sections: _omitted, ...noSections } =
      VALID_PAYLOAD as typeof VALID_PAYLOAD & { sections?: unknown };
    const result = parseLayoutConfig(noSections);
    expect(Array.isArray(result.sections)).toBe(true);
    expect(result.sections).toHaveLength(0);
  });

  it("retains unknown top-level keys (forward-compat)", () => {
    const payload = { ...VALID_PAYLOAD, futureField: "some-value" };
    // Should not throw and should return a valid config
    expect(() => parseLayoutConfig(payload)).not.toThrow();
  });

  it("accepts valid hex colours in 3-digit shorthand", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, primary: "#0FA" },
    };
    const result = parseLayoutConfig(payload);
    expect(result.tokens.primary).toBe("#0FA");
  });

  it("accepts valid hex colours with alpha channel (8 digits)", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, accent: "#0EA5E9FF" },
    };
    const result = parseLayoutConfig(payload);
    expect(result.tokens.accent).toBe("#0EA5E9FF");
  });

  it("parses sections with gradient backgrounds", () => {
    const payload = {
      ...VALID_PAYLOAD,
      sections: [
        {
          id: "hero",
          type: "heroBanner",
          background: {
            mode: "gradient",
            colors: ["primary", "secondary"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          },
        },
      ],
    };
    const result = parseLayoutConfig(payload);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].id).toBe("hero");
  });

  it("parses sections with image backgrounds including optional overlay", () => {
    const payload = {
      ...VALID_PAYLOAD,
      sections: [
        {
          id: "hero",
          type: "heroBanner",
          background: {
            mode: "image",
            uri: "https://example.com/img.jpg",
            overlay: "secondary",
          },
        },
      ],
    };
    const result = parseLayoutConfig(payload);
    const bg = result.sections[0].background as {
      mode: string;
      overlay?: string;
    };
    expect(bg.mode).toBe("image");
    expect(bg.overlay).toBe("secondary");
  });
});

// ─── 2. Malformed token colours ────────────────────────────────────────────────

describe("parseLayoutConfig — malformed token colours", () => {
  it("falls back to DEFAULT_LAYOUT_CONFIG when a required hex colour is missing", () => {
    const { primary: _omitted, ...tokensWithoutPrimary } = VALID_TOKENS;
    const payload = { ...VALID_PAYLOAD, tokens: tokensWithoutPrimary };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when a colour value is not a valid hex string", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, primary: "teal" },
    };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when a colour value is an RGB string", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, background: "rgb(248, 250, 252)" },
    };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when a hex string has wrong digit count (5 digits)", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, accent: "#0EA5E" },
    };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when tokens is entirely absent", () => {
    const { tokens: _omitted, ...noTokens } =
      VALID_PAYLOAD as typeof VALID_PAYLOAD & { tokens?: unknown };
    const result = parseLayoutConfig(noTokens);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when tokens is null", () => {
    const payload = { ...VALID_PAYLOAD, tokens: null };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });
});

// ─── 3. Malformed top-level fields ────────────────────────────────────────────

describe("parseLayoutConfig — malformed top-level fields", () => {
  it("falls back when version is an empty string", () => {
    const payload = { ...VALID_PAYLOAD, version: "" };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when themeName is an unrecognised value", () => {
    const payload = { ...VALID_PAYLOAD, themeName: "christmas" };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when the entire payload is null", () => {
    const result = parseLayoutConfig(null);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when the payload is a plain string", () => {
    const result = parseLayoutConfig("not-an-object");
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when copy.greeting is an empty string", () => {
    const payload = {
      ...VALID_PAYLOAD,
      copy: { ...VALID_PAYLOAD.copy, greeting: "" },
    };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });

  it("falls back when features.festivalBanner is a string instead of boolean", () => {
    const payload = {
      ...VALID_PAYLOAD,
      features: { ...VALID_PAYLOAD.features, festivalBanner: "yes" },
    };
    const result = parseLayoutConfig(payload);
    expect(result).toEqual(DEFAULT_LAYOUT_CONFIG);
  });
});

// ─── 4. Custom fallback ────────────────────────────────────────────────────────

describe("parseLayoutConfig — custom fallback parameter", () => {
  const customFallback = {
    ...DEFAULT_LAYOUT_CONFIG,
    clinicName: "Custom Fallback Clinic",
  };

  it("uses the provided custom fallback when validation fails", () => {
    const result = parseLayoutConfig(null, customFallback);
    expect(result.clinicName).toBe("Custom Fallback Clinic");
  });

  it("does NOT use the custom fallback when validation succeeds", () => {
    const result = parseLayoutConfig(VALID_PAYLOAD, customFallback);
    expect(result.clinicName).toBe("Tapza Care Clinics");
  });
});

// ─── 5. LayoutConfigSchema direct ─────────────────────────────────────────────

describe("LayoutConfigSchema.safeParse — direct schema access", () => {
  it("reports success: true for a valid payload", () => {
    const result = LayoutConfigSchema.safeParse(VALID_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it("reports success: false for a payload with invalid colour", () => {
    const result = LayoutConfigSchema.safeParse({
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, primary: "notacolor" },
    });
    expect(result.success).toBe(false);
  });

  it("includes error issues describing the failing field", () => {
    const result = LayoutConfigSchema.safeParse({
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, primary: "bad" },
    });
    if (result.success) throw new Error("Expected failure");
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it("accepts spacingScale and typeScale as positive numbers", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, spacingScale: 1.2, typeScale: 0.9 },
    };
    const result = LayoutConfigSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive spacingScale", () => {
    const payload = {
      ...VALID_PAYLOAD,
      tokens: { ...VALID_TOKENS, spacingScale: 0 },
    };
    const result = LayoutConfigSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
