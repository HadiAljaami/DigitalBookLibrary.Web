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

export type UsersReportQuery = {
  search?: string;
  isActive?: boolean;
};

export type UserReportRow = {
  userId: number;
  username: string;
  email: string;
  isActive: boolean;
  dateCreated: string;
  reads: number;
  downloads: number;
  saved: number;
  comments: number;
  ratings: number;
  lastActivity: string | null;
};

export type UsersReportTotals = {
  users: number;
  reads: number;
  downloads: number;
};

export type UsersReport = {
  rows: UserReportRow[];
  totals: UsersReportTotals;
};
