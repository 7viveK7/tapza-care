import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/core/api/client";
import { devSettings } from "@/core/api/devSettings";
import { readConfigCache, writeConfigCache } from "@/core/config/cache";
import type { LayoutConfig } from "@/types/config";

export const layoutConfigQueryKey = ["config"] as const;

/**
 * Fetch the layout config with offline resilience.
 *
 * Success path:
 *   GET /config → validate → write to AsyncStorage cache → return to UI.
 *
 * Failure path (network error, forced failure, or offline):
 *   Catch the error → read last-good config from AsyncStorage cache.
 *   If the cache is also empty, re-throw so the error UI renders normally.
 *
 * The query key includes `devSettings.isFestivalTheme` so toggling the
 * festival flag from DevPanel (+ invalidateQueries) always triggers a
 * fresh fetch rather than returning the cached React Query result.
 */
export function useLayoutConfig() {
  return useQuery({
    queryKey: [...layoutConfigQueryKey, devSettings.isFestivalTheme],
    queryFn: async (): Promise<LayoutConfig> => {
      try {
        const config = await apiClient<LayoutConfig>("/config");
        // Persist the fresh config in the background — don't await so it
        // doesn't add to the query's perceived latency.
        void writeConfigCache(config);
        return config;
      } catch (err) {
        const cached = await readConfigCache();
        if (cached !== null) {
          // Return the cached value — React Query will treat this as a
          // successful response, so the UI renders normally offline.
          return cached;
        }
        // No cache at all — propagate the original error.
        throw err;
      }
    },
  });
}
