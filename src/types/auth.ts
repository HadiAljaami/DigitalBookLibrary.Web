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

/** Full profile from GET /auth/me and /me/profile. */
export type UserProfile = {
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
  isActive: boolean;
  roles: string[];
};

/** Payload for editing one's own profile. */
export type UpdateProfileDto = {
  fullName: string;
  phone?: string | null;
  bio?: string | null;
  birthDate?: string | null;
  nationalityCountryId?: number | null;
  cityId?: number | null;
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

export const Roles = {
  Admin: "Admin",
  Member: "Member",
  Author: "Author",
} as const;
