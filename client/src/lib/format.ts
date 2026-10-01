const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  
  const number = new Intl.NumberFormat("en-IN");
  
  const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
  
  export function formatCurrency(value: number): string {
    return currency.format(value);
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