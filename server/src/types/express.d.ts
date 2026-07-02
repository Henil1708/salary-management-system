import type { User as PrismaUser } from '../generated/prisma/client';

declare global {
  namespace Express {
    // What passport strategies attach as req.user: the JWT strategies attach
    // only the token claims (no DB hit on the access path); the local and
    // refresh strategies also attach the loaded DB user.
    interface User {
      userId: string;
      tokenVersion: number;
      user?: PrismaUser;
    }
  }
}

export {};
