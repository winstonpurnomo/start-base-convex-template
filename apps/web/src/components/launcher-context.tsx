import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { ActionGroup } from "./launcher";

export type { ActionGroup, ActionItem } from "./launcher";

interface LauncherContextValue {
  registerCommands: (id: string, groups: ActionGroup[]) => void;
  unregisterCommands: (id: string) => void;
  localCommandGroups: ActionGroup[];
}

const LauncherContext = createContext<LauncherContextValue | null>(null);

export function LauncherProvider({ children }: { children: ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, ActionGroup[]>>({});

  const registerCommands = (id: string, groups: ActionGroup[]) => {
    setRegistry((prev) => ({ ...prev, [id]: groups }));
  };

  const unregisterCommands = (id: string) => {
    setRegistry((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id))
    );
  };

  const localCommandGroups = Object.values(registry).flat();

  return (
    <LauncherContext.Provider
      value={{ registerCommands, unregisterCommands, localCommandGroups }}
    >
      {children}
    </LauncherContext.Provider>
  );
}

export function useLauncherContext() {
  const ctx = useContext(LauncherContext);
  if (!ctx) {
    throw new Error("useLauncherContext must be used within LauncherProvider");
  }
  return ctx;
}

export function useRegisterCommands(groups: ActionGroup[], deps: unknown[]) {
  const { registerCommands, unregisterCommands } = useLauncherContext();
  const id = useRef(crypto.randomUUID()).current;

  useEffect(() => {
    registerCommands(id, groups);
    return () => unregisterCommands(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
