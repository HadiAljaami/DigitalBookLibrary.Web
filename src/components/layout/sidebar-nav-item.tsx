import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Flyouts/tooltips open toward the content: away from whichever edge the rail sits on. */
function useFlyoutSide() {
  const { isRtl } = useLanguage();
  return isRtl ? ("left" as const) : ("right" as const);
}

type Props = {
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
};

const baseLink =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
const activeLink = "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm";
const idleLink = "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground";

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
          cn(baseLink, collapsed && "justify-center px-0", isActive ? activeLink : idleLink)
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
    <CollapsedParent item={item} label={label} active={childActive} onNavigate={onNavigate} />
  ) : (
    <ExpandedParent item={item} label={label} active={childActive} onNavigate={onNavigate} />
  );
}

/** Wraps a collapsed icon so its label shows on hover. */
function IconTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const side = useFlyoutSide();
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Expanded sidebar: inline accordion. Opens automatically when a child route is active. */
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
  const [open, setOpen] = useState(active);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(baseLink, "w-full", active ? "text-sidebar-foreground" : idleLink)}
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
                  "flex items-center gap-3 rounded-lg py-2 ps-6 pe-3 text-sm transition-colors",
                  // A short connector line keeps nested items visually anchored to the parent.
                  "relative before:absolute before:start-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:opacity-40",
                  isActive ? activeLink : idleLink,
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

/** Collapsed rail: parent shows children in a flyout popover on click. */
function CollapsedParent({
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
  const side = useFlyoutSide();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(baseLink, "w-full justify-center px-0", active ? activeLink : idleLink)}
        >
          <item.icon className="h-5 w-5 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align="start">
        <FlyoutList item={item} label={label} onNavigate={onNavigate} t={t} />
      </PopoverContent>
    </Popover>
  );
}

function FlyoutList({
  item,
  label,
  onNavigate,
  t,
}: {
  item: NavItem;
  label: string;
  onNavigate: () => void;
  t: (k: string) => string;
}) {
  return (
    <>
      <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{label}</p>
      {item.children!.map((child) => (
        <NavLink
          key={child.to}
          to={child.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "block rounded-sm px-2 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
            )
          }
        >
          {t(`nav.${child.labelKey}`)}
        </NavLink>
      ))}
    </>
  );
}
