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