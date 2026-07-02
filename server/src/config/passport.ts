import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import prisma from '@config/database';
import { env } from '@config/env';
import { comparePassword } from '@utils/password';
import { TokenPayload } from '@utils/jwt';

// Three strategies per docs/TRADEOFFS.md §4:
//  - `local`        — login with email OR username + password
//  - `jwt-access`   — every protected route; pure in-memory check, NO DB hit
//  - `jwt-refresh`  — /auth/refresh only; loads the user and enforces the
//                     tokenVersion match (the stateless revocation mechanism)
export const configurePassport = (): void => {
  passport.use(
    'local',
    new LocalStrategy(
      { usernameField: 'identifier', passwordField: 'password', session: false },
      async (identifier, password, done) => {
        try {
          const user = await prisma.user.findFirst({
            where: { OR: [{ email: identifier }, { username: identifier }] },
          });

          if (!user || !(await comparePassword(password, user.passwordHash))) {
            return done(null, false);
          }

          return done(null, { userId: user.id, tokenVersion: user.tokenVersion, user });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    'jwt-access',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.JWT_ACCESS_SECRET,
      },
      (payload: TokenPayload, done) => {
        if (payload.type !== 'access') {
          return done(null, false);
        }
        // Deliberately no DB lookup here — the access token's short TTL
        // bounds the revocation window (docs/TRADEOFFS.md §4)
        return done(null, { userId: payload.userId, tokenVersion: payload.tokenVersion });
      }
    )
  );

  passport.use(
    'jwt-refresh',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.JWT_REFRESH_SECRET,
      },
      async (payload: TokenPayload, done) => {
        try {
          if (payload.type !== 'refresh') {
            return done(null, false);
          }

          // The DB check that matters: user still exists AND the token's
          // version matches — incrementing User.tokenVersion invalidates
          // every previously issued refresh token
          const user = await prisma.user.findUnique({ where: { id: payload.userId } });
          if (!user || user.tokenVersion !== payload.tokenVersion) {
            return done(null, false);
          }

          return done(null, { userId: user.id, tokenVersion: user.tokenVersion, user });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default passport;
