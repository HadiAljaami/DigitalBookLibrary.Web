import { type PaginationParams } from "./api";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  dateCreated: string;
  roles: string[];
};

export type AdminUserQuery = PaginationParams & {
  search?: string;
  isActive?: boolean;
  role?: string;
};

/** Create/update payload — mirrors the backend UpdateUserDto. */
export type SaveUserDto = {
  username: string;
  email: string;
  phone?: string | null;
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
