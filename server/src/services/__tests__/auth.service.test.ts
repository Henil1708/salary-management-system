import { comparePassword } from '@utils/password';
import { generateResetToken } from '@utils/jwt';
import { BadRequestError, UnauthorizedError } from '@utils/errors';

jest.mock('@config/database', () => ({
  __esModule: true,
  default: {
    user: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    passwordResetToken: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import prisma from '@config/database';
import { getProfile, requestPasswordReset, resetPassword } from '@services/auth.service';

const mockPrisma = prisma as jest.Mocked<typeof prisma> & {
  user: { findFirst: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  passwordResetToken: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  $transaction: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.$transaction.mockResolvedValue([]);
});

describe('requestPasswordReset', () => {
  it('creates a hashed, time-boxed token for an existing account', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', email: 'hr@acme.com' });

    const before = Date.now();
    await requestPasswordReset('hr@acme.com');

    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    const data = mockPrisma.passwordResetToken.create.mock.calls[0][0].data;
    expect(data.userId).toBe('u1');
    // only the SHA-256 hash is persisted — 64 hex chars, and never equal to
    // anything that could have gone into the emailed link twice
    expect(data.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    // expiry ≈ now + 30 min (default RESET_TOKEN_TTL_MINUTES)
    const ttlMs = data.expiresAt.getTime() - before;
    expect(ttlMs).toBeGreaterThan(29 * 60 * 1000);
    expect(ttlMs).toBeLessThan(31 * 60 * 1000);
  });

  it('looks up by email OR username', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    await requestPasswordReset('hrmanager');
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ email: 'hrmanager' }, { username: 'hrmanager' }] },
    });
  });

  it('does nothing (and does not throw) for an unknown account — no enumeration', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    await expect(requestPasswordReset('nobody@nowhere.com')).resolves.toBeUndefined();
    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
  });
});

describe('resetPassword', () => {
  it('rejects an unknown/expired/used token with RESET_TOKEN_INVALID', async () => {
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue(null);

    await expect(resetPassword('deadbeef', 'NewPassw0rd!')).rejects.toMatchObject({
      code: 'RESET_TOKEN_INVALID',
      statusCode: 400,
    });
    await expect(resetPassword('deadbeef', 'NewPassw0rd!')).rejects.toBeInstanceOf(
      BadRequestError
    );
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('only accepts unused, unexpired tokens looked up by hash', async () => {
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue(null);
    const { raw, hash } = generateResetToken();

    await resetPassword(raw, 'NewPassw0rd!').catch(() => undefined);

    const where = mockPrisma.passwordResetToken.findFirst.mock.calls[0][0].where;
    expect(where.tokenHash).toBe(hash); // raw token is never queried directly
    expect(where.used).toBe(false);
    expect(where.expiresAt.gt).toBeInstanceOf(Date);
  });

  it('consumes the token, writes the new hash and increments tokenVersion in one transaction', async () => {
    mockPrisma.passwordResetToken.findFirst.mockResolvedValue({ id: 't1', userId: 'u1' });

    await resetPassword('some-raw-token', 'NewPassw0rd!');

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

    const userUpdate = mockPrisma.user.update.mock.calls[0][0];
    expect(userUpdate.where).toEqual({ id: 'u1' });
    // tokenVersion bump = every previously issued refresh token dies now
    expect(userUpdate.data.tokenVersion).toEqual({ increment: 1 });
    // stored value is a real bcrypt hash of the new password
    await expect(
      comparePassword('NewPassw0rd!', userUpdate.data.passwordHash)
    ).resolves.toBe(true);

    expect(mockPrisma.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { used: true },
    });
  });
});

describe('getProfile', () => {
  it('returns the public shape for an existing user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'hr@acme.com',
      username: 'hrmanager',
      designation: 'HR Manager',
      passwordHash: 'secret',
      tokenVersion: 0,
    });

    const profile = await getProfile('u1');
    expect(profile).toEqual({
      id: 'u1',
      email: 'hr@acme.com',
      username: 'hrmanager',
      designation: 'HR Manager',
    });
    expect(profile).not.toHaveProperty('passwordHash');
  });

  it('throws AUTH_UNAUTHORIZED when the account no longer exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(getProfile('gone')).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
