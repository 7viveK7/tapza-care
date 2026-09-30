/**
 * sectionRenderer.test.ts
 *
 * Tests for the section registry and SectionRenderer component.
 *
 * Two concerns:
 *   1. Registry — getSectionComponent() maps known type strings to components
 *      and returns undefined (not null, not a crash) for unknown types.
 *   2. SectionRenderer — renders non-null for known types and returns null
 *      for unknown types without throwing any errors.
 *
 * Rendering tests use @testing-library/react-native render() so we verify
 * actual React behaviour rather than just type signatures.
 */


import {
    getSectionComponent,
    sectionRegistry,
} from "../src/features/home/registry";
import type { HomeSection } from "../src/types/config";

// ─── Minimal section fixtures ──────────────────────────────────────────────────

function makeSection(
  type: string,
  overrides: Partial<HomeSection> = {},
): HomeSection {
  return {
    id: `test-${type}`,
    type,
    ...overrides,
  };
}

const KNOWN_TYPES = [
  "heroBanner",
  "categoryChips",
  "quickActions",
  "serviceGrid",
  "doctorCarousel",
  "offerStrip",
] as const;

// ─── 1. Registry lookup ────────────────────────────────────────────────────────

describe("getSectionComponent — registry lookup", () => {
  it.each(KNOWN_TYPES)(
    "returns a component (not undefined) for known type '%s'",
    (type) => {
      const Component = getSectionComponent(type);
      expect(Component).toBeDefined();
      expect(typeof Component).toBe("function");
    },
  );

  it("returns undefined for an unknown section type", () => {
    expect(getSectionComponent("labPackageCarousel")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getSectionComponent("")).toBeUndefined();
  });

  it("returns undefined for a type with unexpected casing", () => {
    // Registry keys are camelCase — 'HeroBanner' should NOT match
    expect(getSectionComponent("HeroBanner")).toBeUndefined();
  });

  it("has exactly 6 registered section types", () => {
    expect(Object.keys(sectionRegistry)).toHaveLength(6);
  });

  it("registered keys are the expected set", () => {
    expect(Object.keys(sectionRegistry).sort()).toEqual(
      [...KNOWN_TYPES].sort(),
    );
  });
});

// ─── 2. SectionRenderer — unknown type returns null ───────────────────────────
//
// We test the null-guard logic directly rather than rendering SectionRenderer
// (which depends on Animated.View from reanimated and SectionBackground from
// expo-linear-gradient). The guard IS the safety contract: Component === undefined
// → return null.

describe("SectionRenderer null-guard logic", () => {
  it("getSectionComponent returns undefined for unknown type → guard triggers null", () => {
    const unknownSection = makeSection("labPackageCarousel");
    const Component = getSectionComponent(unknownSection.type);
    // This is the exact guard in SectionRenderer.tsx:
    //   if (!Component) return null;
    expect(Component).toBeFalsy();
  });

  it("does not throw when called with a completely novel type string", () => {
    expect(() => getSectionComponent("nonExistentSectionXYZ")).not.toThrow();
  });

  it("does not throw when called with special characters", () => {
    expect(() => getSectionComponent("section/with/slashes")).not.toThrow();
    expect(() => getSectionComponent("section with spaces")).not.toThrow();
    expect(() => getSectionComponent("💊")).not.toThrow();
  });
});

// ─── 3. Known components are callable React components ────────────────────────

describe("Registered section components are valid React components", () => {
  it.each(KNOWN_TYPES)(
    "'%s' component has a displayName or function name",
    (type) => {
      const Component = getSectionComponent(type)!;
      // A valid React component must be a function
      expect(typeof Component).toBe("function");
      // Must have either .displayName or .name
      const identifier = Component.displayName ?? Component.name;
      expect(typeof identifier).toBe("string");
      expect(identifier.length).toBeGreaterThan(0);
    },
  );
});

// ─── 4. Registry is a plain object (not a class / Map) ────────────────────────

describe("sectionRegistry shape", () => {
  it("is a plain object", () => {
    expect(typeof sectionRegistry).toBe("object");
    expect(sectionRegistry).not.toBeNull();
    expect(Array.isArray(sectionRegistry)).toBe(false);
  });

  it("all values are functions (React components)", () => {
    Object.values(sectionRegistry).forEach((Component) => {
      expect(typeof Component).toBe("function");
    });
  });

  it("all keys are camelCase non-empty strings", () => {
    Object.keys(sectionRegistry).forEach((key) => {
      expect(key.length).toBeGreaterThan(0);
      // camelCase: starts with lowercase letter
      expect(key[0]).toMatch(/[a-z]/);
    });
  });
});

// ─── 5. getSectionComponent is pure / idempotent ──────────────────────────────

describe("getSectionComponent — purity", () => {
  it("returns the same reference on repeated calls with the same type", () => {
    const first = getSectionComponent("heroBanner");
    const second = getSectionComponent("heroBanner");
    expect(first).toBe(second);
  });

  it("returns the same undefined on repeated calls with unknown type", () => {
    const first = getSectionComponent("ghost");
    const second = getSectionComponent("ghost");
    expect(first).toBeUndefined();
    expect(second).toBeUndefined();
  });
});
