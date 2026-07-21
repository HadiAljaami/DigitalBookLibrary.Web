/*
  A tiny external toast store — the `toast` API is a plain function callable from anywhere
  (event handlers, React Query callbacks, services), and a single <Toaster/> subscribes to render.

  The state is anchored on globalThis so there is exactly ONE store even if this module ends up
  evaluated more than once (which can happen under Vite/HMR): every importer shares the same state,
  so a toast pushed from one place is always seen by the Toaster.

  Auto-dismiss is age-based: each toast records when it was created, and the Toaster runs one
  interval that sweeps expired toasts — deterministic, and free of per-toast timer lifecycle issues.
*/

export type ToastVariant = "success" | "error";
export type Toast = { id: number; message: string; variant: ToastVariant; createdAt: number };

type ToastState = {
  toasts: Toast[];
  nextId: number;
  listeners: Set<() => void>;
};

const GLOBAL_KEY = "__appToastState__";
const globalRef = globalThis as unknown as Record<string, ToastState | undefined>;
const state: ToastState = (globalRef[GLOBAL_KEY] ??= { toasts: [], nextId: 1, listeners: new Set() });

function emit() {
  state.listeners.forEach((listener) => listener());
}

function push(message: string, variant: ToastVariant) {
  state.toasts = [...state.toasts, { id: state.nextId++, message, variant, createdAt: Date.now() }];
  emit();
}

export function dismiss(id: number) {
  state.toasts = state.toasts.filter((t) => t.id !== id);
  emit();
}

/** Removes toasts older than maxAgeMs. Called on an interval by the Toaster. */
export function sweep(maxAgeMs: number) {
  const now = Date.now();
  const next = state.toasts.filter((t) => now - t.createdAt < maxAgeMs);
  if (next.length !== state.toasts.length) {
    state.toasts = next;
    emit();
  }
}

export const toastStore = {
  subscribe(listener: () => void) {
    state.listeners.add(listener);
    return () => {
      state.listeners.delete(listener);
    };
  },
  getSnapshot: () => state.toasts,
};

export const toast = {
  success: (message: string) => push(message, "success"),
  error: (message: string) => push(message, "error"),
};
