import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useStore } from "../lib/store";

export function UserRoute({ children }: { children: ReactNode }) {
  const { user, isAuthReady } = useStore();
  const location = useLocation();
  if (!isAuthReady) return null;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isAuthReady } = useStore();
  if (!isAuthReady) return null;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
