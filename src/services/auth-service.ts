import { api } from "@/lib/api-client";
import { type AuthResult, type LoginRequest, type UserProfile } from "@/types/auth";

export const authService = {
  login: (body: LoginRequest) => api.post<AuthResult>("/auth/login", body),
  me: () => api.get<UserProfile>("/auth/me"),
  logout: (refreshToken: string) => api.post<null>("/auth/logout", { refreshToken }),
};
