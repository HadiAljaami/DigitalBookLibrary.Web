import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Download,
  Eye,
  Lock,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { BookRating } from "@/components/public/book-rating";
import { BookComments } from "@/components/public/book-comments";
import { catalogService } from "@/services/catalog-service";
import { memberService } from "@/services/member-service";
import { useLanguages, useLocalName, findById } from "@/hooks/use-lookups";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { formatNumber } from "@/lib/format";

export function PublicBookPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const bookId = Number(id);
  const { name: localName } = useLocalName();
  const { isAuthenticated } = useAuth();
  const languages = useLanguages();
  const queryClient = useQueryClient();

  const [readerUrl, setReaderUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"read" | "download" | null>(null);

  const book = useQuery({
    queryKey: ["public-book", bookId],
    queryFn: () => catalogService.book(bookId),
    enabled: Number.isFinite(bookId),
  });

  // Whether the current member has saved this book (checked against their saved list).
  const savedList = useQuery({
    queryKey: ["me-saved-ids"],
    queryFn: () => memberService.savedBooks({ pageNumber: 1, pageSize: 200 }),
    enabled: isAuthenticated,
  });
  const isSaved = savedList.data?.items.some((x) => x.id === bookId) ?? false;

  const saveMutation = useMutation({
    mutationFn: () => (isSaved ? memberService.unsave(bookId) : memberService.save(bookId)),
    onSuccess: () => {
      toast.success(isSaved ? t("public.removed") : t("public.saved"));
      queryClient.invalidateQueries({ queryKey: ["me-saved-ids"] });
      queryClient.invalidateQueries({ queryKey: ["me-library"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  // Reading is recorded only when the member explicitly marks it read (opening the PDF doesn't count).
  const readStatus = useQuery({
    queryKey: ["me-read-status", bookId],
    queryFn: () => memberService.readStatus(bookId),
    enabled: isAuthenticated && Number.isFinite(bookId),
  });
  const isRead = readStatus.data?.isRead ?? false;

  const markReadMutation = useMutation({
    mutationFn: () => memberService.markRead(bookId),
    onSuccess: () => {
      toast.success(t("public.markedRead"));
      queryClient.invalidateQueries({ queryKey: ["me-read-status", bookId] });
      queryClient.invalidateQueries({ queryKey: ["me-library"] });
      queryClient.invalidateQueries({ queryKey: ["public-book", bookId] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  // Streams the PDF (auth-only) and opens it inline in a reader dialog — a preview, not a download.
  async function openReader() {
    setBusy("read");
    try {
      const blob = await memberService.readBook(bookId);
      setReaderUrl(URL.createObjectURL(blob));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    setBusy("download");
    try {
      const blob = await memberService.downloadBook(bookId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${book.data?.title ?? "book"}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  function closeReader() {
    if (readerUrl) URL.revokeObjectURL(readerUrl);
    setReaderUrl(null);
  }

  const b = book.data;

  if (book.isLoading) {
    return <p className="py-16 text-center text-muted-foreground">{t("common.loading")}</p>;
  }
  if (!b) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{t("common.noData")}</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/library">{t("public.backToLibrary")}</Link>
        </Button>
      </div>
    );
  }

  const languageName = localName(findById(languages.data, b.languageId), b.languageName);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link to="/library">
          <ArrowLeft className="h-4 w-4" />
          {t("public.backToLibrary")}
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Cover */}
        <div className="mx-auto w-full max-w-[280px]">
          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {b.imageUrl ? (
              <ZoomableImage
                src={b.imageUrl}
                alt={b.title}
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
                caption={b.title}
              />
            ) : (
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{b.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {b.authors.length ? b.authors.map((a) => a.name).join("، ") : "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {b.categoryName && <Badge variant="secondary">{b.categoryName}</Badge>}
            {languageName && <Badge variant="outline">{languageName}</Badge>}
            {b.publisherName && <Badge variant="outline">{b.publisherName}</Badge>}
            {b.ratingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-sm text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                {b.averageRating.toFixed(1)}
                <span className="text-muted-foreground">({b.ratingCount})</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Download className="h-4 w-4" /> {formatNumber(b.downloadsCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" /> {formatNumber(b.readsCount)}
            </span>
            {b.pages != null && <span>{b.pages} {t("books.pages")}</span>}
          </div>

          {b.description && (
            <p className="whitespace-pre-line leading-relaxed text-foreground/90">{b.description}</p>
          )}

          {/* Actions — reading and downloading require a signed-in member. */}
          <div className="flex flex-wrap gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Button className="gap-2" disabled={!b.hasFile || busy !== null} onClick={openReader}>
                  {busy === "read" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  {t("public.read")}
                </Button>
                <Button
                  variant={isRead ? "secondary" : "outline"}
                  className="gap-2"
                  disabled={!b.hasFile || isRead || markReadMutation.isPending}
                  onClick={() => markReadMutation.mutate()}
                >
                  {markReadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className={"h-4 w-4" + (isRead ? " text-success" : "")} />
                  )}
                  {t(isRead ? "public.readDone" : "public.markRead")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!b.hasFile || !b.isAvailable || busy !== null}
                  onClick={downloadPdf}
                >
                  {busy === "download" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {t("public.download")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                  {t(isSaved ? "public.saved" : "public.save")}
                </Button>
              </>
            ) : (
              <Button asChild className="gap-2">
                <Link to="/login" state={{ from: `/library/books/${bookId}` }}>
                  <Lock className="h-4 w-4" />
                  {t("public.signInToRead")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ratings + comments */}
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <BookRating bookId={bookId} />
        <div className="md:col-start-2">
          <BookComments bookId={bookId} />
        </div>
      </div>

      {/* Inline PDF reader (preview) */}
      <Dialog open={readerUrl !== null} onOpenChange={(open) => !open && closeReader()}>
        <DialogContent className="h-[88vh] max-w-5xl p-2">
          <DialogTitle className="sr-only">{b.title}</DialogTitle>
          {readerUrl && (
            <iframe src={readerUrl} title={b.title} className="h-full w-full rounded-md border" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
