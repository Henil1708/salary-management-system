// Reference list consumed by client dropdowns, server-side Zod validation and
// the seed script — single source of truth so the lists can't drift apart.
export const COUNTRIES = [
  { code: 'US', name: 'United States', defaultCurrency: 'USD' },
  { code: 'GB', name: 'United Kingdom', defaultCurrency: 'GBP' },
  { code: 'DE', name: 'Germany', defaultCurrency: 'EUR' },
  { code: 'IN', name: 'India', defaultCurrency: 'INR' },
  { code: 'JP', name: 'Japan', defaultCurrency: 'JPY' },
  { code: 'CA', name: 'Canada', defaultCurrency: 'CAD' },
  { code: 'AU', name: 'Australia', defaultCurrency: 'AUD' },
  { code: 'BR', name: 'Brazil', defaultCurrency: 'BRL' },
] as const;

export type Country = (typeof COUNTRIES)[number];
export type CountryCode = Country['code'];
export type CurrencyCode = Country['defaultCurrency'];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as unknown as [
  CountryCode,
  ...CountryCode[],
];

export const CURRENCY_CODES = [...new Set(COUNTRIES.map((c) => c.defaultCurrency))] as unknown as [
  CurrencyCode,
  ...CurrencyCode[],
];
