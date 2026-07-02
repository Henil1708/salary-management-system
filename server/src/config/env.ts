import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Validated at boot so a missing/malformed variable fails fast with a clear
// message instead of surfacing as a runtime error deep in a request handler.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  // Pooled (pgbouncer) connection for app queries; direct connection for
  // Prisma migrations (read by prisma.config.ts)
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = parsed.data;
