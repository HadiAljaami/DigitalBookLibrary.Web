import { useTranslation } from "react-i18next";
import { Library, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/providers/sidebar-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarNavItem } from "./sidebar-nav-item";

export function Sidebar() {
  const { t } = useTranslation();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const closeMobile = () => setMobileOpen(false);

  // Collapse is a desktop-only concept; the mobile drawer always shows the full sidebar.
  const rail = isDesktop && collapsed;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} aria-hidden />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-[width,transform] duration-300 lg:static",
          "w-64",
          rail && "lg:w-[76px]",
          // Off-canvas on mobile: hidden past the inline-start edge until opened.
          "start-0 -translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0",
          mobileOpen && "translate-x-0 rtl:translate-x-0",
        )}
      >
        {/* Header: brand + the single collapse toggle (top). */}
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-3">
          {rail ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={t("sidebar.expand")}
              className="mx-auto text-sidebar-foreground hover:bg-white/10 hover:text-white"
            >
              <PanelLeftOpen className="h-5 w-5 rtl:rotate-180" />
            </Button>
          ) : (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                <Library className="h-5 w-5" />
              </div>
              <span className="flex-1 text-lg font-bold">{t("common.appName")}</span>

              {/* Desktop: collapse. Mobile: close drawer. */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                aria-label={t("sidebar.collapse")}
                className="hidden text-sidebar-foreground hover:bg-white/10 hover:text-white lg:flex"
              >
                <PanelLeftClose className="h-5 w-5 rtl:rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobile}
                aria-label={t("common.close")}
                className="text-sidebar-foreground hover:bg-white/10 hover:text-white lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navigation.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.titleKey &&
                (rail ? (
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
                  collapsed={rail}
                  onNavigate={closeMobile}
                />
              ))}
            </div>
          ))}
        </nav>

        {!rail && (
          <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/50">
            © {new Date().getFullYear()} {t("common.appName")}
          </div>
        )}
      </aside>
    </>
  );
}
