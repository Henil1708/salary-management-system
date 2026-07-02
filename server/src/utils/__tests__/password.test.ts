import { comparePassword, hashPassword } from '@utils/password';

describe('password hashing', () => {
  it('hashes and verifies a password roundtrip', async () => {
    const hash = await hashPassword('S3cure-Pass!');
    expect(hash).not.toContain('S3cure-Pass!');
    await expect(comparePassword('S3cure-Pass!', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('S3cure-Pass!');
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('uses bcrypt cost 12 (docs/TRADEOFFS.md §4)', async () => {
    const hash = await hashPassword('S3cure-Pass!');
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
  });
});
