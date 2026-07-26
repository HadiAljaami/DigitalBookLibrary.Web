import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  PenTool,
  ScrollText,
  Settings,
  BarChart3,
  Building2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  /** i18n key under "nav". */
  labelKey: string;
  /** Route path. Optional for a pure parent whose only job is to group children. */
  to?: string;
  icon: LucideIcon;
  /** Nested links. A parent renders as an expandable group. */
  children?: NavChild[];
};

export type NavChild = {
  labelKey: string;
  to: string;
};

export type NavSection = {
  /** Optional i18n key for a section heading. */
  titleKey?: string;
  items: NavItem[];
};

/*
  Navigation is data-driven: to reuse this dashboard in another project, edit this list only.
  An item with `children` becomes an expandable group; a plain item is a direct link.
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
      { labelKey: "publishers", to: "/publishers", icon: Building2 },
    ],
  },
  {
    titleKey: "nav.administration",
    items: [
      { labelKey: "users", to: "/users", icon: Users },
      { labelKey: "authorRequests", to: "/author-requests", icon: UserPlus },
      {
        labelKey: "reports",
        icon: BarChart3,
        children: [
          { labelKey: "reportsOverview", to: "/reports/overview" },
          { labelKey: "reportsBooks", to: "/reports/books" },
          { labelKey: "reportsUsers", to: "/reports/users" },
        ],
      },
      { labelKey: "audit", to: "/audit", icon: ScrollText },
      { labelKey: "settings", to: "/settings", icon: Settings },
    ],
  },
];
