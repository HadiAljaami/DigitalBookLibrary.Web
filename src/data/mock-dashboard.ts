/*
  Mock data for the template dashboard. When wiring to a real API, replace these with
  React Query hooks — the components consuming them don't change.
*/

export const activitySeries = [
  { period: "Jan", downloads: 1200, reads: 2400 },
  { period: "Feb", downloads: 1900, reads: 2900 },
  { period: "Mar", downloads: 1600, reads: 3200 },
  { period: "Apr", downloads: 2400, reads: 3800 },
  { period: "May", downloads: 2100, reads: 4200 },
  { period: "Jun", downloads: 2800, reads: 4600 },
  { period: "Jul", downloads: 3200, reads: 5100 },
];

export const categoryDistribution = [
  { label: "Programming", count: 420 },
  { label: "Science", count: 310 },
  { label: "History", count: 190 },
  { label: "Literature", count: 260 },
  { label: "Business", count: 140 },
];

export const topBooks = [
  { title: "Clean Code", downloads: 890 },
  { title: "Refactoring", downloads: 720 },
  { title: "The Pragmatic Programmer", downloads: 640 },
  { title: "Design Patterns", downloads: 510 },
  { title: "Domain-Driven Design", downloads: 430 },
];

export type RecentRow = {
  id: number;
  title: string;
  subtitle: string;
  type: "user" | "book" | "comment";
  when: string;
};

export const recentActivity: RecentRow[] = [
  { id: 1, title: "Sarah Ahmed", subtitle: "sarah@example.com", type: "user", when: "2026-07-18" },
  { id: 2, title: "Clean Architecture", subtitle: "Robert C. Martin", type: "book", when: "2026-07-18" },
  { id: 3, title: "Great read!", subtitle: "on Clean Code", type: "comment", when: "2026-07-17" },
  { id: 4, title: "Omar Khalid", subtitle: "omar@example.com", type: "user", when: "2026-07-17" },
  { id: 5, title: "The Mythical Man-Month", subtitle: "Fred Brooks", type: "book", when: "2026-07-16" },
  { id: 6, title: "Very helpful", subtitle: "on Refactoring", type: "comment", when: "2026-07-16" },
  { id: 7, title: "Layla Hassan", subtitle: "layla@example.com", type: "user", when: "2026-07-15" },
];
