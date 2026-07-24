import { api } from "@/lib/api-client";
import { type PagedResult } from "@/types/api";
import {
  type PublisherDetails,
  type PublisherListItem,
  type PublisherQuery,
  type SavePublisherDto,
} from "@/types/publisher";

export const publisherService = {
  list: (query: PublisherQuery) => api.get<PagedResult<PublisherListItem>>("/publishers", query),
  get: (id: number) => api.get<PublisherDetails>(`/publishers/${id}`),
  create: (body: SavePublisherDto) => api.post<PublisherDetails>("/publishers", body),
  update: (id: number, body: SavePublisherDto) => api.put<PublisherDetails>(`/publishers/${id}`, body),
  delete: (id: number) => api.delete<null>(`/publishers/${id}`),
};
