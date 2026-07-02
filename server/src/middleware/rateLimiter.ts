import rateLimit from 'express-rate-limit';
import { RateLimitError } from '@utils/errors';

// Cheap brute-force insurance on the auth endpoints (docs/TRADEOFFS.md §4).
// In-memory store is deliberate — single-instance deployment, no Redis.

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Too many login attempts, please try again later');
  },
});

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Too many password reset requests, please try again later');
  },
});
