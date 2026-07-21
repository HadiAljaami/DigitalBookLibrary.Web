import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";

/** Gates its children behind authentication; redirects to /login, remembering the target route. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
