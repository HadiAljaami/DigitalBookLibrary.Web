import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Library, X } from "lucide-react";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  /** Mobile off-canvas open state. */
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
          // Off-canvas slides from the inline-start edge in both directions.
          "start-0 rtl:translate-x-full ltr:-translate-x-full lg:rtl:translate-x-0 lg:ltr:translate-x-0",
          open && "translate-x-0 rtl:translate-x-0 ltr:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <Library className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">{t("common.appName")}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navigation.map((section, i) => (
            <div key={i} className="space-y-1">
              {section.titleKey && (
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                  {t(section.titleKey)}
                </p>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground",
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{t(`nav.${item.labelKey}`)}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} {t("common.appName")}
        </div>
      </aside>
    </>
  );
}
