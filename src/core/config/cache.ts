import { parseLayoutConfig } from "@/core/config/schema";
import { storage, STORAGE_KEYS } from "@/core/storage/asyncStorage";
import type { LayoutConfig } from "@/types/config";

/**
 * Persist a successfully-fetched LayoutConfig to AsyncStorage.
 *
 * Called after every successful GET /config so the cache is always as
 * fresh as the last good network response.
 */
export async function writeConfigCache(config: LayoutConfig): Promise<void> {
  await storage.set<LayoutConfig>(STORAGE_KEYS.CONFIG_CACHE, config);
}

/**
 * Read the last persisted LayoutConfig from AsyncStorage.
 *
 * Returns `null` if nothing has been cached yet (first-ever cold start
 * with no network). The result is validated through `parseLayoutConfig`
 * so any corrupt/stale cache entry falls back to the compile-time default
 * rather than crashing.
 */
export async function readConfigCache(): Promise<LayoutConfig | null> {
  const raw = await storage.get<unknown>(STORAGE_KEYS.CONFIG_CACHE);
  if (raw === null) return null;
  // Re-validate: schema may have evolved since the value was stored.
  return parseLayoutConfig(raw);
}

/**
 * Remove the cached config (e.g. for testing or after a sign-out).
 */
export async function clearConfigCache(): Promise<void> {
  await storage.remove(STORAGE_KEYS.CONFIG_CACHE);
}
