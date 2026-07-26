import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Eye, Download, Bookmark } from "lucide-react";
import { memberService } from "@/services/member-service";
import { BecomeAuthorCard } from "@/features/account/become-author-card";
import { type BookListItem } from "@/types/catalog";

type Tab = "read" | "downloaded" | "saved";

export function PublicLibraryPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("saved");

  const fetcher = {
    read: memberService.readBooks,
    downloaded: memberService.downloadedBooks,
    saved: memberService.savedBooks,
  }[tab];

  const books = useQuery({
    queryKey: ["me-library", tab],
    queryFn: () => fetcher({ pageNumber: 1, pageSize: 48 }),
  });

  const items = books.data?.items ?? [];

  const tabs: { key: Tab; label: string; icon: typeof Eye }[] = [
    { key: "saved", label: t("public.tabSaved"), icon: Bookmark },
    { key: "read", label: t("public.tabRead"), icon: Eye },
    { key: "downloaded", label: t("public.tabDownloaded"), icon: Download },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("public.myLibrary")}</h1>
        <p className="text-muted-foreground">{t("public.myLibrarySubtitle")}</p>
      </div>

      <BecomeAuthorCard />

      <div className="inline-flex rounded-lg border bg-muted/40 p-1">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={
                "inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm transition " +
                (tab === tb.key
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <Icon className="h-4 w-4" />
              {tb.label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {books.isLoading ? t("common.loading") : t("public.emptyLibrary")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((b: BookListItem) => (
            <Link
              key={b.id}
              to={`/library/books/${b.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
            >
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-muted">
                {b.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{b.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {b.authors.length ? b.authors.map((a) => a.name).join("، ") : "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
