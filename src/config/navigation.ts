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
    items: [{ labelKey: "dashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    titleKey: "nav.catalog",
    items: [
      { labelKey: "books", to: "/dashboard/books", icon: BookOpen },
      { labelKey: "authors", to: "/dashboard/authors", icon: PenTool },
      { labelKey: "categories", to: "/dashboard/categories", icon: FolderTree },
      { labelKey: "publishers", to: "/dashboard/publishers", icon: Building2 },
    ],
  },
  {
    titleKey: "nav.administration",
    items: [
      { labelKey: "users", to: "/dashboard/users", icon: Users },
      { labelKey: "authorRequests", to: "/dashboard/author-requests", icon: UserPlus },
      {
        labelKey: "reports",
        icon: BarChart3,
        children: [
          { labelKey: "reportsOverview", to: "/dashboard/reports/overview" },
          { labelKey: "reportsBooks", to: "/dashboard/reports/books" },
          { labelKey: "reportsUsers", to: "/dashboard/reports/users" },
        ],
      },
      { labelKey: "audit", to: "/dashboard/audit", icon: ScrollText },
      { labelKey: "settings", to: "/dashboard/settings", icon: Settings },
    ],
  },
];
