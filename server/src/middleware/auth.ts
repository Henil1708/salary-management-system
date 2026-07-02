import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { UnauthorizedError } from '@utils/errors';

// Wraps passport.authenticate so failures flow through our error handler as
// JSend `error` envelopes instead of passport's bare 401 text responses.
const authenticate = (strategy: 'jwt-access' | 'jwt-refresh', code: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
      strategy,
      { session: false },
      (err: Error | null, user: Express.User | false) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(new UnauthorizedError('Invalid or expired token', code));
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  };
};

/** Protects a route with the access-token strategy — no DB hit. */
export const requireAuth = authenticate('jwt-access', 'AUTH_UNAUTHORIZED');

/** /auth/refresh only — verifies the refresh token AND the DB tokenVersion. */
export const requireRefreshToken = authenticate('jwt-refresh', 'AUTH_TOKEN_EXPIRED');
