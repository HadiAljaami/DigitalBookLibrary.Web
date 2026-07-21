import i18n from "@/i18n/config";

function locale() {
  return i18n.language === "ar" ? "ar-SA" : "en-US";
}

/** Localized short date, e.g. "18 Jul 2026" / "١٨ يوليو ٢٠٢٦". */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(locale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Localized short label for a chart bucket (day → "18 Jul", month → "Jul 2026"). */
export function formatPeriod(value: string, interval: "day" | "month"): string {
  const date = new Date(value);
  return interval === "month"
    ? date.toLocaleDateString(locale(), { month: "short", year: "numeric" })
    : date.toLocaleDateString(locale(), { month: "short", day: "numeric" });
}

/** Thousands-separated number in the active locale. */
export function formatNumber(value: number): string {
  return value.toLocaleString(locale());
}
