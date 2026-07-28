import { useEffect } from "react";
import { NavLink, useLocation, useMatch } from "react-router-dom";
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
  const hasChildren = !!item.children?.length;

  if (!hasChildren && item.to) {
    return <LeafItem to={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />;
  }
  return collapsed ? (
    <CollapsedParent item={item} />
  ) : (
    <ExpandedParent item={item} onNavigate={onNavigate} />
  );
}

/**
 * A direct link. Active state is computed with `useMatch` and passed as a *string* className —
 * NavLink's function-form className cannot survive Radix `asChild` (the tooltip trigger), which
 * would stringify it.
 */
function LeafItem({
  to,
  item,
  collapsed,
  onNavigate,
}: {
  to: string;
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const label = t(`nav.${item.labelKey}`);
  const active = !!useMatch({ path: to, end: to === "/dashboard" });

  const link = (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={cn(rowBase, collapsed ? rail : rowExpanded, active ? activeRow : idleRow)}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  return collapsed ? <IconTooltip label={label}>{link}</IconTooltip> : link;
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
function CollapsedParent({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { expandAndOpenGroup } = useSidebar();
  const label = t(`nav.${item.labelKey}`);
  const active = item.children!.some((c) => pathname.startsWith(c.to));

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
function ExpandedParent({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isGroupOpen, toggleGroup, openGroup } = useSidebar();
  const label = t(`nav.${item.labelKey}`);
  const active = item.children!.some((c) => pathname.startsWith(c.to));
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
            <ChildLink key={child.to} to={child.to} label={t(`nav.${child.labelKey}`)} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChildLink({ to, label, onNavigate }: { to: string; label: string; onNavigate: () => void }) {
  const active = !!useMatch({ path: to, end: false });
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center rounded-lg py-2 ps-6 pe-3 text-sm transition-colors",
        "before:absolute before:start-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:opacity-40",
        active ? activeRow : idleRow,
      )}
    >
      {label}
    </NavLink>
  );
}
