import type { Role } from "../types/api";

// Pages only admins may open
const ADMIN_ONLY_PATHS = ["/registrations"];

export function canAccess(path: string, role: Role): boolean {
  const adminOnly = ADMIN_ONLY_PATHS.some(
    (adminPath) => path === adminPath || path.startsWith(`${adminPath}/`),
  );
  return !adminOnly || role === "ADMIN";
}