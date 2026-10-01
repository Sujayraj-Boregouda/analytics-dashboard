import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import type { User } from "../types/api";
import { AuthContext } from "./context";
import type { AuthState } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  const [checkCount, setCheckCount] = useState(0);

  // Ask the server "who am I?" when the app opens, and again on retry
  useEffect(() => {
    const controller = new AbortController();

    api
      .get<User>("/auth/me", controller.signal)
      .then((me) => {
        setUser(me);
        setStatus("authenticated");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        // The server answered "I don't know you" → really logged out
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          setUser(null);
          setStatus("anonymous");
          return;
        }

        // We couldn't get an answer at all → don't assume anything
        console.error(err);
        setStatus("unavailable");
      });

    return () => controller.abort();
  }, [checkCount]);

  const retry = useCallback(() => {
    setStatus("loading");
    setCheckCount((n) => n + 1);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const me = await api.post<User>("/auth/login", { email, password });
    setUser(me);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await api.post<void>("/auth/logout");
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, retry }),
    [user, status, login, logout, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}