import { useState, type ReactNode } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import {
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Enables the global search box; filters across all columns. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Optional toolbar content (filters, buttons) shown next to the search box. */
  toolbar?: ReactNode;
  pageSize?: number;
  loading?: boolean;
};

/**
 * A generic, self-contained table: sorting, global search and client-side pagination.
 * Drive it with a `columns` definition and `data` — nothing here is domain-specific,
 * so it drops into any project unchanged.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = true,
  searchPlaceholder,
  toolbar,
  pageSize = 10,
  loading,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const { pageIndex } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * table.getState().pagination.pageSize + 1;
  const to = Math.min((pageIndex + 1) * table.getState().pagination.pageSize, totalRows);

  return (
    <div className="space-y-4">
      {(searchable || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder ?? t("common.search")}
                className="ps-9"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full max-w-[8rem] animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {t("table.showing", { from, to, total: totalRows })}
        </p>
        <div className="flex items-center gap-1">
          <PagerButton onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsRight className="hidden h-4 w-4 rtl:block" />
            <ChevronsLeft className="h-4 w-4 rtl:hidden" />
          </PagerButton>
          <PagerButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronRight className="hidden h-4 w-4 rtl:block" />
            <ChevronLeft className="h-4 w-4 rtl:hidden" />
          </PagerButton>
          <span className="px-3 text-sm font-medium">
            {pageIndex + 1} {t("table.of")} {table.getPageCount() || 1}
          </span>
          <PagerButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronLeft className="hidden h-4 w-4 rtl:block" />
            <ChevronRight className="h-4 w-4 rtl:hidden" />
          </PagerButton>
          <PagerButton
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsLeft className="hidden h-4 w-4 rtl:block" />
            <ChevronsRight className="h-4 w-4 rtl:hidden" />
          </PagerButton>
        </div>
      </div>
    </div>
  );
}

function PagerButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" size="icon" className={cn("h-8 w-8", className)} {...props}>
      {children}
    </Button>
  );
}
