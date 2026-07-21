export type LoginRequest = {
  identifier: string;
  password: string;
};

/** The user summary embedded in the auth result. */
export type AuthUser = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};

export type AuthResult = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  user: AuthUser;
};

/** Full profile from GET /auth/me. */
export type UserProfile = {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  fullName: string | null;
  isActive: boolean;
  roles: string[];
};

export const Roles = {
  Admin: "Admin",
  Member: "Member",
} as const;
