/**
 * Reactive locale context for Tapza Care.
 *
 * - On first launch, seeds the locale from the device's preferred language
 *   (via expo-localization). Falls back to "en" if unsupported.
 * - Persists the user's explicit choice to AsyncStorage under STORAGE_KEYS.LOCALE.
 * - Calls setLocale() from the i18n util on every change so t() stays in sync.
 * - Any component that calls useLocale() re-renders when the locale changes.
 */

import { getLocales } from "expo-localization";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { storage, STORAGE_KEYS } from "@/core/storage/asyncStorage";
import { getLocale, setLocale, type Locale } from "@/shared/utils/i18n";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPPORTED: Locale[] = ["en", "hi", "te"];

/**
 * Map a BCP-47 language tag (e.g. "hi-IN", "te", "en-US") to one of our
 * three supported locales. Returns "en" if there is no match.
 */
function tagToLocale(tag: string): Locale {
  const base = tag.split("-")[0].toLowerCase() as Locale;
  return SUPPORTED.includes(base) ? base : "en";
}

// ─── Context shape ────────────────────────────────────────────────────────────

export type LocaleContextValue = {
  /** Currently active locale. */
  locale: Locale;
  /** Change locale, persist it, and trigger a re-render everywhere. */
  changeLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Start from whatever locale setLocale() was last called with (defaults to
  // "en" on a fresh module load) — avoids a flicker before the async read.
  const [locale, setLocaleState] = useState<Locale>(getLocale);

  // On mount: read persisted choice → fall back to device locale → "en".
  useEffect(() => {
    void (async () => {
      const persisted = await storage.get<Locale>(STORAGE_KEYS.LOCALE);
      if (persisted && SUPPORTED.includes(persisted)) {
        setLocale(persisted);
        setLocaleState(persisted);
        return;
      }

      // No persisted choice — use the device's primary language.
      const deviceLocales = getLocales();
      const deviceLocale = tagToLocale(deviceLocales[0]?.languageTag ?? "en");
      setLocale(deviceLocale);
      setLocaleState(deviceLocale);
    })();
  }, []);

  const changeLocale = useCallback((next: Locale) => {
    setLocale(next);
    setLocaleState(next);
    void storage.set(STORAGE_KEYS.LOCALE, next);
  }, []);

  const value = useMemo(
    () => ({ locale, changeLocale }),
    [locale, changeLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the current locale and a setter that persists the change.
 *
 * @example
 *   const { locale, changeLocale } = useLocale();
 *   changeLocale("te");   // switches to Telugu, persists, re-renders consumers
 */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a <LocaleProvider>");
  }
  return ctx;
}
