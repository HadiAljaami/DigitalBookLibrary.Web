import { useTranslation } from "react-i18next";
import { Library, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/providers/sidebar-provider";
import { SidebarNavItem } from "./sidebar-nav-item";

export function Sidebar() {
  const { t } = useTranslation();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-[width,transform] duration-300 lg:static",
          collapsed ? "w-[76px]" : "w-64",
          // Off-canvas on mobile: hidden past the inline-start edge until opened.
          "start-0 -translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0",
          mobileOpen && "translate-x-0 rtl:translate-x-0",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <Library className="h-5 w-5" />
          </div>
          {!collapsed && <span className="flex-1 text-lg font-bold">{t("common.appName")}</span>}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-white/10 hover:text-white lg:hidden"
            onClick={closeMobile}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navigation.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.titleKey &&
                (collapsed ? (
                  <div className="mx-auto my-2 h-px w-8 bg-sidebar-border" />
                ) : (
                  <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                    {t(section.titleKey)}
                  </p>
                ))}
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.labelKey}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={closeMobile}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <Button
            variant="ghost"
            onClick={toggleCollapsed}
            className={cn(
              "w-full text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground",
              collapsed ? "justify-center px-0" : "justify-start gap-3",
            )}
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5 rtl:rotate-180" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5 rtl:rotate-180" />
                <span className="text-sm">{t("sidebar.collapse")}</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
