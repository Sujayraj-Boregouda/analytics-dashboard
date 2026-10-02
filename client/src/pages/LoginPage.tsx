import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation } from "react-router";
import { canAccess } from "../auth/access";
import { useAuth } from "../auth/useAuth";
import { Alert, Button, Card, TextField } from "../components/ui";
import { ApiError } from "../lib/api";
import styles from "./LoginPage.module.css";

function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Wrong email or password.";
    if (err.status === 400) return "Please enter a valid email address.";
    if (err.status >= 500) return "The server isn't responding. Try again in a moment.";
    return err.message;
  }
  return "Couldn't reach the server. Check your connection.";
}

export function LoginPage() {
  const { status, user, login } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The page they originally wanted, if any
  const state: unknown = location.state;
  const from =
    typeof state === "object" && state !== null && "from" in state && typeof state.from === "string"
      ? state.from
      : "/";

  if (status === "authenticated") {
    // Only go back to that page if THIS user is allowed to see it
    const target = user && canAccess(from, user.role) ? from : "/";
    return <Navigate to={target} replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.intro}>
          <span className={styles.brand}>Event Analytics</span>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>See registrations, payments and revenue at a glance.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className={styles.form}>
            <TextField
              label="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Alert>{error}</Alert>}
            <Button type="submit" loading={submitting} className={styles.submit}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className={styles.demo}>
          Demo accounts: <strong>admin@demo.com</strong> or <strong>viewer@demo.com</strong>,
          password <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}