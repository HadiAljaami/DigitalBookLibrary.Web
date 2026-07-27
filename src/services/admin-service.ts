import { api } from "@/lib/api-client";
import { type PagedResult } from "@/types/api";
import {
  type AdminUser,
  type AdminUserDetail,
  type AdminUserQuery,
  type AuditLog,
  type AuditQuery,
  type CreateUserDto,
  type SaveUserDto,
} from "@/types/admin";
import { type AuthorRequest, type AuthorRequestQuery } from "@/types/author-request";

export const adminService = {
  users: (query: AdminUserQuery) => api.get<PagedResult<AdminUser>>("/admin/users", query),

  user: (id: number) => api.get<AdminUserDetail>(`/admin/users/${id}`),

  setUserActive: (id: number, isActive: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}/active`, { isActive }),

  setUserRoles: (id: number, roles: string[]) =>
    api.patch<AdminUser>(`/admin/users/${id}/roles`, { roles }),

  createUser: (body: CreateUserDto) => api.post<AdminUser>("/admin/users", body),

  updateUser: (id: number, body: SaveUserDto) => api.put<AdminUser>(`/admin/users/${id}`, body),

  uploadUserAvatar: (id: number, file: File) =>
    api.upload<{ imageUrl: string }>(`/admin/users/${id}/avatar`, file),

  resetUserPassword: (id: number, newPassword: string) =>
    api.put<null>(`/admin/users/${id}/password`, { newPassword }),

  deleteUser: (id: number) => api.delete<null>(`/admin/users/${id}`),

  audit: (query: AuditQuery) => api.get<PagedResult<AuditLog>>("/admin/users/audit", query),

  authorRequests: (query: AuthorRequestQuery) =>
    api.get<PagedResult<AuthorRequest>>("/admin/author-requests", query),
  approveAuthorRequest: (id: number) => api.post<null>(`/admin/author-requests/${id}/approve`),
  rejectAuthorRequest: (id: number, note: string | null) =>
    api.post<null>(`/admin/author-requests/${id}/reject`, { note }),
};
