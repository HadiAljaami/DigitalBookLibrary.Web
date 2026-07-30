import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Bundle the pdf.js worker (matched to the installed pdfjs-dist) so rendering works on any host,
// offline, without an external CDN. Vite fingerprints and serves it from our own origin.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * In-app PDF reader: pdf.js renders each page onto a canvas, so it works identically on desktop
 * and mobile — no download, no blank tab, no reliance on a browser PDF plugin.
 */
export function PdfReader({ fileUrl }: { fileUrl: string }) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  // Track the container width so each page renders to fit the screen (responsive on mobile).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A new file → back to page one.
  useEffect(() => setPage(1), [fileUrl]);

  const pageWidth = Math.min(Math.max(width - 24, 0), 900);

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex flex-1 justify-center overflow-auto bg-muted/30 p-3">
        <Document
          file={fileUrl}
          loading={
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="me-2 h-5 w-5 animate-spin" /> {t("common.loading")}
            </div>
          }
          error={
            <div className="flex h-full items-center justify-center text-destructive">
              {t("common.error")}
            </div>
          }
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {pageWidth > 0 && (
            <Page
              pageNumber={page}
              width={pageWidth}
              className="shadow-md"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>

      {numPages > 0 && (
        <div className="flex items-center justify-center gap-3 border-t bg-background py-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("table.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {numPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= numPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("table.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
