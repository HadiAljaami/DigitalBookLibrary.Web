import { api } from "@/lib/api-client";
import { type BooksReport, type BooksReportQuery } from "@/types/report";

export const reportService = {
  books: (query: BooksReportQuery) => api.get<BooksReport>("/admin/reports/books", query),
};
