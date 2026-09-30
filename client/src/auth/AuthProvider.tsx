import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, ApiError } from "../lib/api";
import type { User } from "../types/api";
import { AuthContext } from "./context";
import type { AuthState } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");

  // When the app first opens, ask the server: "who am I?"
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
        setUser(null);
        setStatus("anonymous");
        if (!(err instanceof ApiError && err.status === 401)) console.error(err);
      });

    return () => controller.abort();
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
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}