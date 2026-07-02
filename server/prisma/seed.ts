// Idempotent seed (docs/TRADEOFFS.md §2): reference data upserted from the
// @salary/shared constants — the same arrays the Zod enums and client
// dropdowns use — plus the HR user (accounts are admin-provisioned, no
// self-registration). The deterministic 10,000-employee generation lands as
// its own step; this file stays safe to re-run at any time.
import { COUNTRIES, DEPARTMENTS } from '@salary/shared';
import prisma from '../src/config/database';
import { hashPassword } from '../src/utils/password';
import logger from '../src/utils/logger';

const HR_USER = {
  email: 'hr@acme.com',
  username: 'hrmanager',
  // Dev/demo credentials — documented in the README, not a production secret
  password: 'DevPassw0rd!',
  designation: 'HR Manager',
};

const seedReferenceData = async (): Promise<void> => {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { name: department },
      update: {},
      create: { name: department },
    });
  }

  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: { name: country.name, defaultCurrency: country.defaultCurrency },
      create: {
        code: country.code,
        name: country.name,
        defaultCurrency: country.defaultCurrency,
      },
    });
  }

  logger.info(`Reference data seeded: ${DEPARTMENTS.length} departments, ${COUNTRIES.length} countries`);
};

const seedHrUser = async (): Promise<void> => {
  const passwordHash = await hashPassword(HR_USER.password);
  await prisma.user.upsert({
    where: { email: HR_USER.email },
    update: {},
    create: {
      email: HR_USER.email,
      username: HR_USER.username,
      passwordHash,
      designation: HR_USER.designation,
    },
  });
  logger.info(`HR user ready: ${HR_USER.email}`);
};

const main = async (): Promise<void> => {
  await seedReferenceData();
  await seedHrUser();
};

main()
  .catch((error) => {
    logger.error('Seed failed', { error });
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
