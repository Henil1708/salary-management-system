import { z } from 'zod';

// Only 'en' ships in v1 — adding a locale later extends this list plus a new
// resource file (docs/TRADEOFFS.md §5)
export const SUPPORTED_LOCALES = ['en'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// The one place the server translates: the rejected-rows report is read
// outside the client app (Excel), so its reason column must arrive as text
// in the requester's language, not as locale keys.
export const importQuerySchema = z.object({
  lang: z.enum(SUPPORTED_LOCALES).default('en'),
});

export type ImportQuery = z.infer<typeof importQuerySchema>;
