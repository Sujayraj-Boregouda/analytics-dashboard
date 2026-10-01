import { createContext } from "react";
import type { User } from "../types/api";

export type AuthState = {
  user: User | null;
  status: "loading" | "authenticated" | "anonymous" | "unavailable";
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);