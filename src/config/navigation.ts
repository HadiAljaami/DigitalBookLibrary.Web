import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  PenTool,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  /** i18n key under "nav". */
  labelKey: string;
  to: string;
  icon: LucideIcon;
};

export type NavSection = {
  /** Optional i18n key for a section heading. */
  titleKey?: string;
  items: NavItem[];
};

/*
  Navigation is data-driven: to reuse this dashboard in another project, edit this list only.
  The sidebar renders whatever is here — no layout code changes needed.
*/
export const navigation: NavSection[] = [
  {
    items: [{ labelKey: "dashboard", to: "/", icon: LayoutDashboard }],
  },
  {
    titleKey: "nav.catalog",
    items: [
      { labelKey: "books", to: "/books", icon: BookOpen },
      { labelKey: "authors", to: "/authors", icon: PenTool },
      { labelKey: "categories", to: "/categories", icon: FolderTree },
    ],
  },
  {
    titleKey: "nav.administration",
    items: [
      { labelKey: "users", to: "/users", icon: Users },
      { labelKey: "audit", to: "/audit", icon: ScrollText },
      { labelKey: "settings", to: "/settings", icon: Settings },
    ],
  },
];
