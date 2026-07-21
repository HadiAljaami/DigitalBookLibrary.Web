import i18n from "@/i18n/config";
import { ApiError } from "@/types/api";

/** Turns an unknown thrown value into a localized message via the `errors.<CODE>` table. */
export function errorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : "default";
  const key = `errors.${code}`;
  const translated = i18n.t(key);
  // i18next returns the key itself when there's no entry — fall back to the generic message.
  return translated === key ? i18n.t("errors.default") : translated;
}
