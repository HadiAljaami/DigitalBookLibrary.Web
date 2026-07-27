import { type PaginationParams } from "./api";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  imageUrl: string | null;
  isActive: boolean;
  dateCreated: string;
  roles: string[];
};

export type AdminUserQuery = PaginationParams & {
  search?: string;
  isActive?: boolean;
  role?: string;
};

/** A single account with its full backing Person and roles, for the edit form. */
export type AdminUserDetail = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  bio: string | null;
  birthDate: string | null;
  nationalityCountryId: number | null;
  cityId: number | null;
  imageUrl: string | null;
  authorId: number | null;
  isActive: boolean;
  dateCreated: string;
  roles: string[];
};

/** Edit payload — mirrors the backend UpdateUserDto. */
export type SaveUserDto = {
  username: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  bio?: string | null;
  birthDate?: string | null;
  nationalityCountryId?: number | null;
  cityId?: number | null;
};

/** Create payload — mirrors the backend CreateUserDto. */
export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
  fullName?: string | null;
  phone?: string | null;
  bio?: string | null;
  birthDate?: string | null;
  nationalityCountryId?: number | null;
  cityId?: number | null;
  roles: string[];
};

export type AuditLog = {
  id: number;
  entityName: string;
  entityId: string | null;
  action: string;
  userId: number | null;
  username: string | null;
  ipAddress: string | null;
  createdAt: string;
  oldValues: string | null;
  newValues: string | null;
};

export type AuditQuery = PaginationParams & {
  entityName?: string;
  action?: string;
};
