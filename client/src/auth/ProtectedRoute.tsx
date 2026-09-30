import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <p style={{ padding: "var(--space-6)", color: "var(--color-text-muted)" }}>Loading…</p>;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}