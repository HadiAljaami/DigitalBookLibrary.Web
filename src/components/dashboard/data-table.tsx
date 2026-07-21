import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * When `server` is provided, the parent owns paging/search/sorting (it fetches each page from an
 * API); the table just reports intent through the callbacks. When omitted, the table does all of it
 * in memory. The columns/cells render identically either way.
 */
export type ServerTableController = {
  /** Total rows on the server, across all pages. */
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: (next: PaginationState) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;
};

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Extra toolbar content (filters, buttons) shown next to the search box. */
  toolbar?: ReactNode;
  pageSizeOptions?: number[];
  loading?: boolean;
  server?: ServerTableController;
};

const DEFAULT_PAGE_SIZES = [10, 20, 50];

export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = true,
  searchPlaceholder,
  toolbar,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  loading,
  server,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const isServer = !!server;

  // --- Client-side state (ignored in server mode) ---
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0],
  });

  // --- Search: keep the input responsive, debounce what we send to the server ---
  const [searchInput, setSearchInput] = useState(server?.search ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const lastSentSearch = useRef(server?.search ?? "");

  useEffect(() => {
    if (isServer && debouncedSearch !== lastSentSearch.current) {
      lastSentSearch.current = debouncedSearch;
      server!.onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, isServer, server]);

  const table = useReactTable({
    data,
    columns,
    // In server mode everything is controlled by the parent.
    state: {
      sorting: isServer ? (server!.sorting ?? []) : sorting,
      pagination: isServer ? server!.pagination : pagination,
      globalFilter: isServer ? undefined : searchInput,
    },
    manualPagination: isServer,
    manualSorting: isServer,
    manualFiltering: isServer,
    rowCount: isServer ? server!.rowCount : undefined,
    onSortingChange: (updater) => {
      if (isServer) {
        const next = typeof updater === "function" ? updater(server!.sorting ?? []) : updater;
        server!.onSortingChange?.(next);
      } else {
        setSorting(updater);
      }
    },
    onPaginationChange: (updater) => {
      if (isServer) {
        const next = typeof updater === "function" ? updater(server!.pagination) : updater;
        server!.onPaginationChange(next);
      } else {
        setPagination(updater);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServer ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServer ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = isServer ? server!.rowCount : table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-4">
      {(searchable || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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

      {/* Footer: page size + range + pager */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("table.rowsPerPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[4.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("table.showing", { from, to, total: totalRows })}
          </p>
        </div>

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

function PagerButton({ children, className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" size="icon" className={cn("h-8 w-8", className)} {...props}>
      {children}
    </Button>
  );
}
