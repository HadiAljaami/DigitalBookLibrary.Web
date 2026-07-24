type Cell = string | number | null | undefined;

function escape(value: Cell): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Builds a CSV (UTF-8 BOM so Excel renders Arabic correctly) and triggers a download. */
export function downloadCsv(filename: string, headers: string[], rows: Cell[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escape).join(","));
  const content = "﻿" + lines.join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
