import type { ReactNode } from "react";
import { Link } from "react-router";
import { EmptyState } from "../components/ui";
import { useAuth } from "./useAuth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== "ADMIN") {
    return (
      <EmptyState
        title="Admins only"
        message="Attendee details are only available to admins."
        action={
          <Link to="/" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            Back to overview
          </Link>
        }
      />
    );
  }

  return children;
}