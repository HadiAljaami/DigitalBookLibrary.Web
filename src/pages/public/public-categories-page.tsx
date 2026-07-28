import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FolderTree, ChevronLeft } from "lucide-react";
import { catalogService } from "@/services/catalog-service";
import { type Category } from "@/types/catalog";

export function PublicCategoriesPage() {
  const { t } = useTranslation();
  const categories = useQuery({ queryKey: ["categories", "tree"], queryFn: () => catalogService.categoryTree() });
  const roots = categories.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("nav.categories")}</h1>
        <p className="text-muted-foreground">{t("public.categoriesSubtitle")}</p>
      </div>

      {roots.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {categories.isLoading ? t("common.loading") : t("common.noData")}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roots.map((root) => (
            <CategoryCard key={root.id} category={root} browseLabel={t("public.browse")} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, browseLabel }: { category: Category; browseLabel: string }) {
  const children = category.children ?? [];
  return (
    <div className="rounded-xl border bg-card p-5">
      <Link
        to={`/?category=${category.id}`}
        className="group flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderTree className="h-5 w-5" />
          </span>
          {category.name}
        </span>
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground transition group-hover:text-primary">
          {browseLabel}
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </span>
      </Link>

      {children.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
          {children.map((child) => (
            <Link
              key={child.id}
              to={`/?category=${child.id}`}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
