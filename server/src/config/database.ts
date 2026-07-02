import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { env } from '@config/env';
import logger from '@utils/logger';

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    // Runtime queries go through Supabase's pooled connection string;
    // migrations use the direct URL via prisma.config.ts.
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

// Cached on `global` in development so ts-node-dev restarts don't exhaust
// the database connection pool.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
  logger.info('Database connected');
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
};

export default prisma;
