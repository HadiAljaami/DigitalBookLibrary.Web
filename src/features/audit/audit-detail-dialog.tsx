import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { type AuditLog } from "@/types/admin";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: AuditLog | null;
};

type Row = { field: string; before: unknown; after: unknown };

function parse(json: string | null): Record<string, unknown> {
  if (!json) return {};
  try {
    const value = JSON.parse(json);
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Renders a value for display: null → "—", objects → compact JSON, everything else as-is. */
function show(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Fields that are noise in a change log. */
const HIDDEN = new Set(["PasswordHash", "RefreshToken", "Token", "TokenHash"]);

function diff(entry: AuditLog): Row[] {
  const before = parse(entry.oldValues);
  const after = parse(entry.newValues);
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((k) => !HIDDEN.has(k));

  return keys
    .map((field) => ({ field, before: before[field], after: after[field] }))
    // On an update only changed fields matter; create/delete have one side empty, so all show.
    .filter((r) => JSON.stringify(r.before) !== JSON.stringify(r.after));
}

export function AuditDetailDialog({ open, onOpenChange, entry }: Props) {
  const { t } = useTranslation();
  if (!entry) return null;

  const rows = diff(entry);
  const isCreate = entry.action === "Create";
  const isDelete = entry.action === "Delete";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {t("audit.changesTitle")}
            <Badge variant="secondary">
              {entry.entityName}
              {entry.entityId ? ` #${entry.entityId}` : ""}
            </Badge>
            <span className="text-sm font-normal text-muted-foreground">
              {entry.action} · {entry.username ?? t("audit.system")} · {formatDate(entry.createdAt)}
            </span>
          </DialogTitle>
        </DialogHeader>

        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("audit.noChanges")}</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-start text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2 pe-3 text-start font-medium">{t("audit.field")}</th>
                  {!isCreate && <th className="py-2 pe-3 text-start font-medium">{t("audit.before")}</th>}
                  {!isDelete && <th className="py-2 text-start font-medium">{t("audit.after")}</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.field} className="border-t align-top">
                    <td className="py-2 pe-3 font-medium">{r.field}</td>
                    {!isCreate && (
                      <td className="py-2 pe-3">
                        <span className="break-all text-muted-foreground line-through decoration-destructive/40">
                          {show(r.before)}
                        </span>
                      </td>
                    )}
                    {!isDelete && (
                      <td className="py-2">
                        <span className="inline-flex items-start gap-1 break-all">
                          {!isCreate && <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />}
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {show(r.after)}
                          </span>
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
