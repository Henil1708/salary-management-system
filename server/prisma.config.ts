import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node -r tsconfig-paths/register prisma/seed.ts',
  },
  datasource: {
    // The CLI (migrate/studio) must use the direct connection — Supabase's
    // pooled URL (pgbouncer) can't run migrations. The app itself connects
    // through the pooled DATABASE_URL via the pg driver adapter instead
    // (see src/config/database.ts).
    url: env('DIRECT_URL'),
  },
});
