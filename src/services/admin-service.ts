import { api } from "@/lib/api-client";
import { type PagedResult } from "@/types/api";
import {
  type AdminUser,
  type AdminUserQuery,
  type AuditLog,
  type AuditQuery,
} from "@/types/admin";

export const adminService = {
  users: (query: AdminUserQuery) => api.get<PagedResult<AdminUser>>("/admin/users", query),

  setUserActive: (id: number, isActive: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}/active`, { isActive }),

  setUserRoles: (id: number, roles: string[]) =>
    api.patch<AdminUser>(`/admin/users/${id}/roles`, { roles }),

  audit: (query: AuditQuery) => api.get<PagedResult<AuditLog>>("/admin/users/audit", query),
};
