import { UpdateProfileInput } from '@salary/shared';
import prisma from '@config/database';
import { env } from '@config/env';
import { User } from '../generated/prisma/client';
import { BadRequestError, FieldValidationError, UnauthorizedError } from '@utils/errors';
import { generateResetToken, hashResetToken, signTokenPair } from '@utils/jwt';
import { comparePassword, hashPassword } from '@utils/password';
import logger from '@utils/logger';

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  designation: string;
}

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  designation: user.designation,
});

export const issueTokens = (user: {
  id: string;
  tokenVersion: number;
}): { accessToken: string; refreshToken: string } => signTokenPair(user);

export const getProfile = async (userId: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedError('Account no longer exists', 'AUTH_UNAUTHORIZED');
  }
  return toPublicUser(user);
};

/** Self-service profile update (Settings). Duplicate email/username → P2002 → fail envelope. */
export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
): Promise<PublicUser> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { username: input.username, email: input.email, designation: input.designation },
  });
  return toPublicUser(user);
};

/**
 * Self-service password change: verify the current password, then in one
 * transaction write the new hash and bump tokenVersion (kills other sessions).
 * A fresh token pair is returned so the CURRENT session survives the bump.
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedError('Account no longer exists', 'AUTH_UNAUTHORIZED');
  }
  if (!(await comparePassword(currentPassword, user.passwordHash))) {
    throw new FieldValidationError({
      currentPassword: 'errors.validation.auth.currentPasswordWrong',
    });
  }

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword), tokenVersion: { increment: 1 } },
    }),
  ]);

  logger.info('Password changed', { userId });
  return signTokenPair(updated);
};

/**
 * Forgot-password step 1–3 (docs/TRADEOFFS.md §4): only the SHA-256 hash of
 * the token is stored; the raw value exists solely in the emailed link.
 * Intentionally returns void whether or not the account exists — the
 * controller always sends the same generic response (no user enumeration).
 */
export const requestPasswordReset = async (identifier: string): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  if (!user) {
    logger.info('Password reset requested for unknown account');
    return;
  }

  const { raw, hash } = generateResetToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + env.RESET_TOKEN_TTL_MINUTES * 60_000),
    },
  });

  // Dev/stub email delivery (PRD out-of-scope: production ESP) — the flow is
  // production-shaped, so swapping in a real provider later is one change here.
  const resetLink = `${env.CORS_ORIGIN}/reset-password?token=${raw}`;
  logger.info('Password reset link issued', { email: user.email, resetLink });
};

/**
 * Reset steps 4–5: validate hash/expiry/single-use, then in ONE transaction
 * write the new password, consume the token, and increment tokenVersion —
 * which immediately invalidates every previously issued refresh token.
 */
export const resetPassword = async (rawToken: string, newPassword: string): Promise<void> => {
  const token = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: hashResetToken(rawToken),
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!token) {
    throw new BadRequestError('This reset link is invalid or has expired', 'RESET_TOKEN_INVALID');
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { used: true },
    }),
  ]);

  logger.info('Password reset completed', { userId: token.userId });
};
