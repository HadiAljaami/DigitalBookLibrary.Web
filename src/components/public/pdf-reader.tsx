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

/**
 * In-app PDF reader: pdf.js renders every page onto a canvas, stacked in one scrollable column —
 * so you scroll through the whole book like a normal PDF viewer, and it works the same on desktop
 * and mobile (no download, no blank tab, no browser PDF plugin).
 */
export function PdfReader({ fileUrl }: { fileUrl: string }) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);

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

  const pageWidth = Math.min(Math.max(width - 24, 0), 900);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden bg-muted/30 p-3">
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
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {pageWidth > 0 &&
          Array.from({ length: numPages }, (_, i) => (
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
    </div>
  );
}
