import { createContext, useContext, type ReactNode } from "react";

import type { LayoutConfig } from "@/types/config";

/**
 * Provides the full resolved LayoutConfig to any descendant inside HomeScreen.
 * Sections use `useLayoutConfigContext()` to access `copy`, `features`, etc.
 * without requiring HomeScreen to thread them through SectionRenderer props.
 */
const LayoutConfigContext = createContext<LayoutConfig | null>(null);

type Props = {
  config: LayoutConfig;
  children: ReactNode;
};

export function LayoutConfigProvider({ config, children }: Props) {
  return (
    <LayoutConfigContext.Provider value={config}>
      {children}
    </LayoutConfigContext.Provider>
  );
}

/**
 * Returns the nearest LayoutConfig, or `null` when rendered outside a
 * LayoutConfigProvider (e.g. in Storybook or isolated tests).
 * Callers must handle the null case gracefully.
 */
export function useLayoutConfigContext(): LayoutConfig | null {
  return useContext(LayoutConfigContext);
}
