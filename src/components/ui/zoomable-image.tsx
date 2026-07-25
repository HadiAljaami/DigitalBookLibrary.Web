import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Props = {
  src: string;
  alt: string;
  /** Classes for the inline (thumbnail) image. */
  className?: string;
  /** Classes for the clickable wrapper (e.g. "h-full w-full" to fill an aspect box). */
  wrapperClassName?: string;
  /** Optional larger caption shown under the zoomed image. */
  caption?: string;
};

/**
 * An image that opens an enlarged preview on click (a lightbox) instead of navigating or
 * downloading. Used for book covers, author photos and other imagery across the app.
 */
export function ZoomableImage({ src, alt, className, wrapperClassName, caption }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={"block cursor-zoom-in overflow-hidden " + (wrapperClassName ?? "")}
        title={alt}
      >
        <img src={src} alt={alt} className={className} loading="lazy" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img
            src={src}
            alt={alt}
            className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain"
          />
          {caption && <p className="text-center text-sm text-muted-foreground">{caption}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
