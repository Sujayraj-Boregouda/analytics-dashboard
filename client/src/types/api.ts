export type Role = "ADMIN" | "VIEWER";

export type User = {
  id: number;
  email: string;
  role: Role;
};