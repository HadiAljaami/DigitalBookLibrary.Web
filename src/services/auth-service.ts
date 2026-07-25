import { api } from "@/lib/api-client";
import { type AuthResult, type LoginRequest, type UserProfile } from "@/types/auth";

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  fullName?: string | null;
};

export const authService = {
  login: (body: LoginRequest) => api.post<AuthResult>("/auth/login", body),
  register: (body: RegisterRequest) =>
    api.post<{ id: number; username: string; email: string; roles: string[] }>("/auth/register", body),
  me: () => api.get<UserProfile>("/auth/me"),
  logout: (refreshToken: string) => api.post<null>("/auth/logout", { refreshToken }),
};
