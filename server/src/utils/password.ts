import bcrypt from 'bcrypt';

// Cost 12 per docs/TRADEOFFS.md §4. Strength rules live in the shared Zod
// schema (resetPasswordSchema), not here — one source of truth.
const SALT_ROUNDS = 12;

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = (password: string, passwordHash: string): Promise<boolean> =>
  bcrypt.compare(password, passwordHash);
