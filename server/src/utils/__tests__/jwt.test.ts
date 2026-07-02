import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  TokenPayload,
  generateResetToken,
  hashResetToken,
  signAccessToken,
  signRefreshToken,
  signTokenPair,
} from '@utils/jwt';
import { env } from '@config/env';

const user = { id: 'user-1', tokenVersion: 3 };

describe('JWT signing', () => {
  it('access token carries userId, tokenVersion and type=access', () => {
    const payload = jwt.verify(signAccessToken(user), env.JWT_ACCESS_SECRET) as TokenPayload;
    expect(payload).toMatchObject({ userId: 'user-1', tokenVersion: 3, type: 'access' });
  });

  it('refresh token carries type=refresh and verifies with the refresh secret', () => {
    const payload = jwt.verify(signRefreshToken(user), env.JWT_REFRESH_SECRET) as TokenPayload;
    expect(payload).toMatchObject({ userId: 'user-1', tokenVersion: 3, type: 'refresh' });
  });

  it('tokens are signed with DIFFERENT secrets (docs/TRADEOFFS.md §4)', () => {
    const { accessToken, refreshToken } = signTokenPair(user);
    // cross-verification must fail — a leaked access secret can't forge refresh tokens
    expect(() => jwt.verify(accessToken, env.JWT_REFRESH_SECRET)).toThrow();
    expect(() => jwt.verify(refreshToken, env.JWT_ACCESS_SECRET)).toThrow();
  });

  it('access token expires per JWT_ACCESS_EXPIRES_IN', () => {
    const payload = jwt.verify(signAccessToken(user), env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    // 15m default in test env
    expect(payload.exp! - payload.iat!).toBe(15 * 60);
  });
});

describe('password reset token', () => {
  it('generates a 32-byte hex token whose stored value is its SHA-256 hash', () => {
    const { raw, hash } = generateResetToken();
    expect(raw).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(crypto.createHash('sha256').update(raw).digest('hex'));
    expect(hashResetToken(raw)).toBe(hash);
  });

  it('generates unique tokens per call', () => {
    expect(generateResetToken().raw).not.toBe(generateResetToken().raw);
  });
});
