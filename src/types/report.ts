import { type PaginationParams } from "./api";
import { type BookListItem } from "./catalog";

export type BooksReportQuery = PaginationParams & {
  search?: string;
  categoryId?: number;
  authorId?: number;
  languageId?: number;
  isAvailable?: boolean;
  /** ISO date (yyyy-MM-dd), inclusive. */
  fromDate?: string;
  toDate?: string;
};

export type BooksReportTotals = {
  books: number;
  downloads: number;
  reads: number;
};

export type BooksReport = {
  rows: BookListItem[];
  totals: BooksReportTotals;
};
