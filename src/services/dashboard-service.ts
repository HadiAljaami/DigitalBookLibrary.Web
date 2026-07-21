import { api } from "@/lib/api-client";
import {
  type ActivityPoint,
  type DashboardSummary,
  type DistributionBy,
  type DistributionSlice,
  type RecentActivity,
  type RecentActivityType,
  type SeriesInterval,
  type TopBook,
  type TopBooksMetric,
} from "@/types/dashboard";

const BASE = "/admin/dashboard";

export const dashboardService = {
  summary: () => api.get<DashboardSummary>(`${BASE}/summary`),

  topBooks: (metric: TopBooksMetric = "downloads", take = 5) =>
    api.get<TopBook[]>(`${BASE}/top-books`, { metric, take }),

  recent: (type: RecentActivityType = "users", take = 6) =>
    api.get<RecentActivity[]>(`${BASE}/recent`, { type, take }),

  activitySeries: (interval: SeriesInterval = "day") =>
    api.get<ActivityPoint[]>(`${BASE}/activity-series`, { interval }),

  distribution: (by: DistributionBy = "category") =>
    api.get<DistributionSlice[]>(`${BASE}/distribution`, { by }),
};
