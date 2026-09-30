import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Typed AsyncStorage wrapper.
 *
 * All values are JSON-serialised. Returns `null` on missing key (not a
 * thrown error) so callers can use nullish coalescing for defaults.
 */
export const storage = {
  /**
   * Read a stored value and JSON-parse it.
   * Returns `null` if the key doesn't exist or parsing fails.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * JSON-serialise a value and write it under `key`.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exceeded or unavailable — degrade silently.
    }
  },

  /**
   * Remove a key entirely.
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },

  /**
   * Merge a partial update into an existing JSON object under `key`.
   * If the key doesn't exist yet the value is written as-is.
   */
  async merge<T extends object>(
    key: string,
    partial: Partial<T>,
  ): Promise<void> {
    try {
      await AsyncStorage.mergeItem(key, JSON.stringify(partial));
    } catch {
      // Fall back to a full write if mergeItem isn't supported.
      const existing = await storage.get<T>(key);
      await storage.set<T>(key, { ...(existing ?? {}), ...partial } as T);
    }
  },
} as const;

/** Storage keys used across the app — centralised to avoid typos. */
export const STORAGE_KEYS = {
  /** Map of `{prescriptionId}:{medicineId}:{date}:{timing}` → boolean (`true` = taken). */
  DOSE_RECORDS: "dose_records_v1",
} as const;
