import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useSidebar } from "@/providers/sidebar-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
};

// Shared classes. `rail` fixes the icon box size so collapsed items line up perfectly.
const rowBase = "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors";
const rowExpanded = "px-3 py-2.5";
const rail = "mx-auto h-11 w-11 justify-center p-0"; // fixed square → straight, aligned column
const activeRow = "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm";
const idleRow = "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground";

export function SidebarNavItem({ item, collapsed, onNavigate }: Props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const label = t(`nav.${item.labelKey}`);
  const hasChildren = !!item.children?.length;
  const childActive = item.children?.some((c) => pathname.startsWith(c.to)) ?? false;

  // ---- Leaf link ----
  if (!hasChildren && item.to) {
    const link = (
      <NavLink
        to={item.to}
        end={item.to === "/"}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(rowBase, collapsed ? rail : rowExpanded, isActive ? activeRow : idleRow)
        }
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    );
    return collapsed ? <IconTooltip label={label}>{link}</IconTooltip> : link;
  }

  // ---- Parent with children ----
  return collapsed ? (
    <CollapsedParent item={item} label={label} active={childActive} />
  ) : (
    <ExpandedParent item={item} label={label} active={childActive} onNavigate={onNavigate} />
  );
}

/** Shows the label on hover when the rail is collapsed. */
function IconTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const { isRtl } = useLanguage();
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={isRtl ? "left" : "right"}>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Collapsed parent: a plain icon that expands the rail and opens its group on click. */
function CollapsedParent({
  item,
  label,
  active,
}: {
  item: NavItem;
  label: string;
  active: boolean;
}) {
  const { expandAndOpenGroup } = useSidebar();
  const button = (
    <button
      type="button"
      onClick={() => expandAndOpenGroup(item.labelKey)}
      className={cn(rowBase, rail, active ? activeRow : idleRow)}
    >
      <item.icon className="h-5 w-5 shrink-0" />
    </button>
  );
  return <IconTooltip label={label}>{button}</IconTooltip>;
}

/** Expanded parent: an inline accordion. Opens automatically when one of its routes is active. */
function ExpandedParent({
  item,
  label,
  active,
  onNavigate,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const { isGroupOpen, toggleGroup, openGroup } = useSidebar();
  const open = isGroupOpen(item.labelKey);

  // Keep the active group open (e.g. after navigating straight to a child route).
  useEffect(() => {
    if (active) openGroup(item.labelKey);
  }, [active, item.labelKey, openGroup]);

  return (
    <div>
      <button
        type="button"
        onClick={() => toggleGroup(item.labelKey)}
        className={cn(rowBase, rowExpanded, "w-full", active ? "text-sidebar-foreground" : idleRow)}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-start">{label}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-1 space-y-1 ps-4 animate-fade-in">
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center rounded-lg py-2 ps-6 pe-3 text-sm transition-colors",
                  "before:absolute before:start-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:opacity-40",
                  isActive ? activeRow : idleRow,
                )
              }
            >
              {t(`nav.${child.labelKey}`)}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
