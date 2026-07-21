import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dismiss, sweep, toastStore, type Toast } from "@/lib/toast-store";

const AUTO_DISMISS_MS = 4000;

/** Subscribes to the toast store and renders the stack. Mount once, near the app root. */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>(() => toastStore.getSnapshot());

  useEffect(() => toastStore.subscribe(() => setToasts(toastStore.getSnapshot())), []);

  // One interval sweeps expired toasts and re-syncs from the store. The poll is a safety net: it
  // guarantees new toasts appear (within the interval) even if a subscribe notification is ever
  // missed, and getSnapshot returns a stable reference so an unchanged store causes no re-render.
  useEffect(() => {
    const interval = setInterval(() => {
      sweep(AUTO_DISMISS_MS);
      setToasts(toastStore.getSnapshot());
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 end-4 z-[100] flex w-full max-w-xs flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2"
        >
          {toast.variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <span className={cn("flex-1", toast.variant === "error" && "text-destructive")}>
            {toast.message}
          </span>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
