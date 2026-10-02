import { NavLink, Outlet } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { cx } from "../../lib/cx";
import { Badge, Button } from "../ui";
import styles from "./AppShell.module.css";

function navClass({ isActive }: { isActive: boolean }) {
  return cx(styles.navLink, isActive && styles.navLinkActive);
}

export function AppShell() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.left}>
            <span className={styles.brand}>Event Analytics</span>
            <nav className={styles.nav} aria-label="Main">
              <NavLink to="/" end className={navClass}>
                Overview
              </NavLink>
              {isAdmin && (
                <NavLink to="/registrations" className={navClass}>
                  Registrations
                </NavLink>
              )}
            </nav>
          </div>

          {user && (
            <div className={styles.user}>
              <span className={styles.email}>{user.email}</span>
              <Badge tone={isAdmin ? "info" : "neutral"}>{user.role}</Badge>
              <Button variant="ghost" onClick={() => void logout()}>
                Log out
              </Button>
            </div>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}