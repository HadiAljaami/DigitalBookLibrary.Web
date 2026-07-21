import { useMemo, useState } from "react";
import { type PaginationState, type SortingState } from "@tanstack/react-table";
import { type ServerTableController } from "@/components/dashboard/data-table";

/**
 * Owns the paging/search/sorting state for a server-driven table and exposes both the query
 * inputs (for the data fetch) and the controller the DataTable needs. Resets to the first page
 * whenever the search term or page size changes, so results never land on an out-of-range page.
 */
export function useServerTable(initialPageSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const controller = (rowCount: number): ServerTableController => ({
    rowCount,
    pagination,
    onPaginationChange: setPagination,
    search,
    onSearchChange: (value) => {
      setSearch(value);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    sorting,
    onSortingChange: setSorting,
  });

  // 1-based page number for the API; `search` is trimmed to omit empty filters.
  const query = useMemo(
    () => ({
      pageNumber: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: search.trim() || undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, search],
  );

  return { query, controller, pagination, sorting, setPagination };
}
