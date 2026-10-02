const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat("en-IN");

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

const dateTime = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

// 75000 → "₹75K"
export function formatCompactCurrency(value: number): string {
  return compactCurrency.format(value);
}

export function formatNumber(value: number): string {
  return number.format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// "2026-09-05" → "5 Sept"
export function formatShortDate(isoDate: string): string {
  return shortDate.format(new Date(`${isoDate}T00:00:00`));
}

// "2026-09-27T08:12:14.758Z" → "27 Sept, 1:42 pm"
export function formatDateTime(isoDateTime: string): string {
  return dateTime.format(new Date(isoDateTime));
}