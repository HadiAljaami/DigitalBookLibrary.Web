import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SidebarContextValue = {
  /** Desktop: icon-only rail when true. Persisted. */
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;

  /** Mobile: off-canvas open state. Not persisted. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;

  /** Which parent groups are expanded (by labelKey). */
  openGroups: string[];
  toggleGroup: (key: string) => void;
  openGroup: (key: string) => void;
  isGroupOpen: (key: string) => boolean;
  /** Expand the rail and open a group — used when a collapsed parent icon is clicked. */
  expandAndOpenGroup: (key: string) => void;
};

const STORAGE_KEY = "app.sidebar.collapsed";
const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const value = useMemo<SidebarContextValue>(() => {
    const openGroup = (key: string) =>
      setOpenGroups((groups) => (groups.includes(key) ? groups : [...groups, key]));

    return {
      collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((c) => !c),
      mobileOpen,
      setMobileOpen,
      openGroups,
      isGroupOpen: (key) => openGroups.includes(key),
      openGroup,
      toggleGroup: (key) =>
        setOpenGroups((groups) =>
          groups.includes(key) ? groups.filter((g) => g !== key) : [...groups, key],
        ),
      expandAndOpenGroup: (key) => {
        setCollapsed(false);
        openGroup(key);
      },
    };
  }, [collapsed, mobileOpen, openGroups]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
