import { type PaginationParams } from "./api";

export type PublisherListItem = {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  isActive: boolean;
  booksCount: number;
};

export type PublisherDetails = {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  logoUrl: string | null;
  isActive: boolean;
  booksCount: number;
};

/** Create/update payload — mirrors the backend SavePublisherDto. */
export type SavePublisherDto = {
  name: string;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
};

export type PublisherQuery = PaginationParams & {
  search?: string;
  isActive?: boolean;
};
