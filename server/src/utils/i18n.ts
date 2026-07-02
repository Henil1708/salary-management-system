import { SupportedLocale, VALIDATION_LIMITS, enLocale } from '@salary/shared';

// The server is language-unaware everywhere EXCEPT the CSV rejected-rows
// report, which is read outside the client app (docs/TRADEOFFS.md §5) — this
// tiny resolver exists solely for that. It reads the same locale resources
// the client uses; adding a language means registering its file here.
const LOCALES: Record<SupportedLocale, Record<string, unknown>> = {
  en: enLocale as unknown as Record<string, unknown>,
};

const lookup = (resource: Record<string, unknown>, key: string): string | undefined => {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
      resource
    );
  return typeof value === 'string' ? value : undefined;
};

const interpolate = (text: string): string =>
  text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const limit = VALIDATION_LIMITS[name as keyof typeof VALIDATION_LIMITS];
    return limit !== undefined ? String(limit) : match;
  });

/** Resolve a locale key to text, falling back to English, then the key itself. */
export const translate = (key: string, lang: SupportedLocale): string => {
  const text = lookup(LOCALES[lang], key) ?? lookup(LOCALES.en, key);
  return text ? interpolate(text) : key;
};
