export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export function formatMoney(value: string | number) { return money.format(Number(value) || 0); }
export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", options ?? { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
export function monthKey(value: string | Date) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
