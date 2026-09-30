import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/core/api/client";
import { devSettings } from "@/core/api/devSettings";
import type { LayoutConfig } from "@/types/config";

export const layoutConfigQueryKey = ["config"] as const;

export function useLayoutConfig() {
  return useQuery({
    queryKey: [...layoutConfigQueryKey, devSettings.isFestivalTheme],
    queryFn: () => apiClient<LayoutConfig>("/config"),
  });
}
