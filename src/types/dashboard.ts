export type DashboardSummary = {
  books: number;
  users: number;
  authors: number;
  categories: number;
  downloads: number;
  reads: number;
};

export type TopBook = {
  bookId: number;
  title: string;
  authorName: string | null;
  downloads: number;
  reads: number;
  averageRating: number;
  ratingsCount: number;
};

export type ActivityPoint = {
  period: string;
  downloads: number;
  reads: number;
};

export type DistributionSlice = {
  label: string;
  count: number;
};

export type RecentActivity = {
  type: "user" | "book" | "comment";
  id: number;
  title: string;
  subtitle: string | null;
  when: string;
};

export type TopBooksMetric = "downloads" | "reads" | "rating";
export type RecentActivityType = "users" | "books" | "comments";
export type SeriesInterval = "day" | "month";
export type DistributionBy = "category" | "language";
