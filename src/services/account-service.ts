import { api } from "@/lib/api-client";
import { type ChangePasswordDto, type UpdateProfileDto, type UserProfile } from "@/types/auth";

export const accountService = {
  profile: () => api.get<UserProfile>("/me/profile"),
  updateProfile: (body: UpdateProfileDto) => api.put<UserProfile>("/me/profile", body),
  changePassword: (body: ChangePasswordDto) => api.put<null>("/me/password", body),
  uploadAvatar: (file: File) => api.upload<{ imageUrl: string }>("/me/avatar", file),
};
