import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/auth-service";
import { setAuthExpiredHandler } from "@/lib/api-client";
import { tokenStorage } from "@/lib/token-storage";
import { type AuthUser, Roles } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser());

  // If a refresh ultimately fails, drop the session so the guarded routes bounce to /login.
  useEffect(() => {
    setAuthExpiredHandler(() => setUser(null));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.roles.includes(Roles.Admin) ?? false,

      async login(identifier, password) {
        const result = await authService.login({ identifier, password });
        tokenStorage.setSession(result.accessToken, result.refreshToken, result.user);
        setUser(result.user);
      },

      async logout() {
        const refreshToken = tokenStorage.getRefreshToken();
        try {
          if (refreshToken) await authService.logout(refreshToken);
        } catch {
          // Best-effort: even if the server call fails, clear the local session below.
        }
        tokenStorage.clear();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
