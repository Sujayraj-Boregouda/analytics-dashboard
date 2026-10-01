import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { ErrorState } from "../components/ui";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <p style={{ padding: "var(--space-6)", color: "var(--color-text-muted)" }}>Loading…</p>;
  }

  if (status === "unavailable") {
    return (
      <div style={{ maxWidth: 520, margin: "var(--space-7) auto", padding: "0 var(--space-4)" }}>
        <ErrorState
          message="Can't reach the server right now. You're still signed in."
          onRetry={retry}
        />
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}