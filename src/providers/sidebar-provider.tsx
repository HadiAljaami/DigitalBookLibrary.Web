import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarContextValue = {
  /** Desktop: icon-only rail when true. Persisted. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile: off-canvas open state. Not persisted. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const STORAGE_KEY = "app.sidebar.collapsed";
const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggleCollapsed: () => setCollapsed((c) => !c),
      mobileOpen,
      setMobileOpen,
    }),
    [collapsed, mobileOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
