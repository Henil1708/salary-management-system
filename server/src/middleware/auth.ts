import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { UnauthorizedError } from '@utils/errors';

// Wraps passport.authenticate so failures flow through our error handler as
// JSend `error` envelopes instead of passport's bare 401 text responses.
const authenticate = (
  strategy: 'local' | 'jwt-access' | 'jwt-refresh',
  message: string,
  code: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
      strategy,
      { session: false },
      (err: Error | null, user: Express.User | false) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next(new UnauthorizedError(message, code));
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  };
};

/** Login only — verifies identifier + password via the local strategy. */
export const requireLocalCredentials = authenticate(
  'local',
  'Invalid email/username or password',
  'AUTH_INVALID_CREDENTIALS'
);

/** Protects a route with the access-token strategy — no DB hit. */
export const requireAuth = authenticate(
  'jwt-access',
  'Invalid or expired token',
  'AUTH_UNAUTHORIZED'
);

/** /auth/refresh only — verifies the refresh token AND the DB tokenVersion. */
export const requireRefreshToken = authenticate(
  'jwt-refresh',
  'Invalid or expired refresh token',
  'AUTH_TOKEN_EXPIRED'
);
