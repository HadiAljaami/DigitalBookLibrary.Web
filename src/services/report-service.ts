import { api } from "@/lib/api-client";
import {
  type BooksReport,
  type BooksReportQuery,
  type UsersReport,
  type UsersReportQuery,
} from "@/types/report";

export const reportService = {
  books: (query: BooksReportQuery) => api.get<BooksReport>("/admin/reports/books", query),
  users: (query: UsersReportQuery) => api.get<UsersReport>("/admin/reports/users", query),
};
