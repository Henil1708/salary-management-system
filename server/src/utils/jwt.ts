import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';

// Access and refresh tokens are signed with DIFFERENT secrets so a leaked
// access-token secret can't forge refresh tokens (docs/TRADEOFFS.md §4).
// Verification is passport-jwt's job (config/passport.ts) — only signing
// and the reset-token helpers live here.

export interface TokenPayload {
  userId: string;
  tokenVersion: number;
  type: 'access' | 'refresh';
}

interface TokenSubject {
  id: string;
  tokenVersion: number;
}

export const signAccessToken = (user: TokenSubject): string =>
  jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion, type: 'access' } satisfies TokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions
  );

export const signRefreshToken = (user: TokenSubject): string =>
  jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion, type: 'refresh' } satisfies TokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions
  );

export const signTokenPair = (user: TokenSubject): { accessToken: string; refreshToken: string } => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user),
});

export const hashResetToken = (rawToken: string): string =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

/**
 * Password-reset token: the raw value goes into the emailed link only;
 * just its SHA-256 hash is stored (docs/TRADEOFFS.md §4).
 */
export const generateResetToken = (): { raw: string; hash: string } => {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashResetToken(raw) };
};
