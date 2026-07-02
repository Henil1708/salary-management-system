// Locale-aware Intl formatting for money, numbers and dates — never manual
// string building (docs/TRADEOFFS.md §5); composes with a future locale switch.

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  options?: { compact?: boolean }
): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: options?.compact ? 'compact' : 'standard',
    maximumFractionDigits: options?.compact ? 1 : 0,
  }).format(amount);

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat(undefined).format(value);

export const formatDate = (value: Date | string): string =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
