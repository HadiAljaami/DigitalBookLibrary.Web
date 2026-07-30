import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

// Bundle the pdf.js worker (matched to the installed pdfjs-dist) so rendering works on any host,
// offline, without an external CDN. Vite fingerprints and serves it from our own origin.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const INITIAL_PAGES = 3;
const PAGE_STEP = 3;

/**
 * In-app PDF reader: pdf.js renders pages onto canvases in one scrollable column. Pages are rendered
 * incrementally (a few at a time as you scroll) rather than all at once — rendering a whole book's
 * pages simultaneously exhausts memory on some mobile browsers and leaves a blank page.
 */
export function PdfReader({ fileUrl }: { fileUrl: string }) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [rendered, setRendered] = useState(INITIAL_PAGES);

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

  // Render more pages as the reader is scrolled near the bottom.
  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 800) {
      setRendered((r) => Math.min(r + PAGE_STEP, numPages));
    }
  }

  const pageWidth = Math.min(Math.max(width - 24, 0), 900);
  const count = Math.min(rendered, numPages);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="h-full overflow-y-auto overflow-x-hidden bg-muted/30 p-3"
    >
      <Document
        file={fileUrl}
        loading={
          <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
            <Loader2 className="me-2 h-5 w-5 animate-spin" /> {t("common.loading")}
          </div>
        }
        error={
          <div className="flex h-[70vh] items-center justify-center text-destructive">
            {t("common.error")}
          </div>
        }
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setRendered(INITIAL_PAGES);
        }}
      >
        {pageWidth > 0 &&
          Array.from({ length: count }, (_, i) => (
            <div key={i} className="mb-3 flex justify-center">
              <Page
                pageNumber={i + 1}
                width={pageWidth}
                className="shadow-md"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
      </Document>

      {count > 0 && count < numPages && (
        <div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
          <Loader2 className="me-2 h-4 w-4 animate-spin" /> {count} / {numPages}
        </div>
      )}
    </div>
  );
}
