import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";

/**
 * Gates the admin dashboard: an authenticated non-admin (a member) is sent to the public library
 * rather than the dashboard. Assumes it sits inside a ProtectedRoute (auth already enforced).
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
