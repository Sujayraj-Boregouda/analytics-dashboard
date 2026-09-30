import { useAuth } from "../auth/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Analytics Dashboard</h1>
      <p>
        Signed in as <strong>{user?.email}</strong> ({user?.role})
      </p>
      <button onClick={() => void logout()}>Log out</button>
    </main>
  );
}