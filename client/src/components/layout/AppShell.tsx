import { Outlet } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { Badge, Button } from "../ui";
import styles from "./AppShell.module.css";

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>Event Analytics</span>
          {user && (
            <div className={styles.user}>
              <span className={styles.email}>{user.email}</span>
              <Badge tone={user.role === "ADMIN" ? "info" : "neutral"}>{user.role}</Badge>
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