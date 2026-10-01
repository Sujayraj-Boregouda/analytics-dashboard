export type Role = "ADMIN" | "VIEWER";

export type User = {
  id: number;
  email: string;
  role: Role;
};

export type Summary = {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  revenue: number;
  conversionRate: number;
};

export type DailyPoint = {
  date: string;
  registrations: number;
  cumulative: number;
};