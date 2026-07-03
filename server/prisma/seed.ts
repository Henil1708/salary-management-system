// Deterministic seed (docs/TRADEOFFS.md §2): faker.seed(42) makes every run
// produce identical data, so dashboard numbers are reproducible for demos and
// grading. Salaries are sampled from per-(country, jobLevel) bands with a
// lognormal-ish spread — NOT flat random — so the dashboard's aggregates look
// like a real org instead of noise. Idempotent: employees are wiped and
// regenerated; reference data and the HR user are upserted.
import { faker } from '@faker-js/faker';
import {
  COUNTRIES,
  DEPARTMENTS,
  type CountryCode,
  type JobLevel,
} from '@salary/shared';
import prisma from '../src/config/database';
import { hashPassword } from '../src/utils/password';
import logger from '../src/utils/logger';

faker.seed(42);

const EMPLOYEE_COUNT = 10_000;
const BATCH_SIZE = 1_000;
const FX_AS_OF = new Date('2026-01-01');
// No salary record may be effective after this date (fixed, for determinism)
const HISTORY_CUTOFF = new Date('2026-06-30');

const HR_USER = {
  email: 'hr@acme.com',
  username: 'hrmanager',
  // Dev/demo credentials — documented in the README, not a production secret
  password: 'DevPassw0rd!',
  designation: 'HR Manager',
};

// Median MONTHLY salary in LOCAL currency per (country, level) — salaries are
// stored and reported monthly (a monthly payroll run), not annual. These bands
// make "average salary by country/level" a meaningful chart.
const SALARY_BANDS: Record<CountryCode, Record<JobLevel, number>> = {
  US: { Junior: 5_800, Mid: 7_900, Senior: 10_800, Manager: 13_300, Director: 17_500 },
  GB: { Junior: 3_300, Mid: 4_600, Senior: 6_300, Manager: 7_900, Director: 10_800 },
  DE: { Junior: 4_000, Mid: 5_200, Senior: 6_700, Manager: 8_300, Director: 11_300 },
  IN: { Junior: 66_700, Mid: 116_700, Senior: 183_300, Manager: 266_700, Director: 416_700 },
  JP: { Junior: 375_000, Mid: 500_000, Senior: 666_700, Manager: 875_000, Director: 1_166_700 },
  CA: { Junior: 5_400, Mid: 7_100, Senior: 9_200, Manager: 11_300, Director: 15_000 },
  AU: { Junior: 5_800, Mid: 7_500, Senior: 9_800, Manager: 12_100, Director: 15_800 },
  BR: { Junior: 7_500, Mid: 10_800, Senior: 15_800, Manager: 21_700, Director: 31_700 },
};

const FX_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  GBP: 1.27,
  EUR: 1.08,
  INR: 0.012,
  JPY: 0.0067,
  CAD: 0.73,
  AUD: 0.66,
  BRL: 0.18,
};

// Headcount pyramids (more ICs than managers) and realistic org weights.
const LEVEL_WEIGHTS: Array<[JobLevel, number]> = [
  ['Junior', 0.4],
  ['Mid', 0.3],
  ['Senior', 0.17],
  ['Manager', 0.09],
  ['Director', 0.04],
];
const COUNTRY_WEIGHTS: Array<[CountryCode, number]> = [
  ['US', 0.28],
  ['IN', 0.2],
  ['DE', 0.13],
  ['GB', 0.12],
  ['CA', 0.09],
  ['JP', 0.08],
  ['AU', 0.06],
  ['BR', 0.04],
];
const DEPARTMENT_WEIGHTS: Array<[string, number]> = [
  ['Engineering', 0.3],
  ['Sales', 0.18],
  ['Customer Support', 0.14],
  ['Marketing', 0.1],
  ['Operations', 0.1],
  ['Finance', 0.08],
  ['Human Resources', 0.06],
  ['Legal', 0.04],
];

const weightedPick = <T>(entries: Array<[T, number]>): T => {
  let roll = faker.number.float({ min: 0, max: 1 });
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return value;
    }
  }
  return entries[entries.length - 1]![0];
};

// Lognormal-ish multiplier around 1.0 via Box–Muller, driven by faker's
// seeded RNG — Math.random() would break determinism.
const salarySpread = (): number => {
  const u1 = faker.number.float({ min: 1e-9, max: 1 });
  const u2 = faker.number.float({ min: 0, max: 1 });
  const standardNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(0.18 * standardNormal);
};

const sampleSalary = (country: CountryCode, level: JobLevel): number => {
  const base = SALARY_BANDS[country][level];
  // round to the nearest 100 in local currency — salaries, not noise
  return Math.round((base * salarySpread()) / 100) * 100;
};

const RAISE_REASONS = ['Annual raise', 'Market adjustment', 'Promotion'];

interface EmployeeSeed {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  countryId: string;
  jobLevel: string;
  status: string;
  hireDate: Date;
}

interface SalaryRecordSeed {
  employeeId: string;
  amount: number;
  currency: string;
  effectiveDate: Date;
  reason: string;
  isCurrent: boolean;
}

const seedReferenceData = async (): Promise<void> => {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { name: department },
      update: {},
      create: { name: department },
    });
  }

  for (const country of COUNTRIES) {
    const row = await prisma.country.upsert({
      where: { code: country.code },
      update: { name: country.name, defaultCurrency: country.defaultCurrency },
      create: {
        code: country.code,
        name: country.name,
        defaultCurrency: country.defaultCurrency,
      },
    });

    await prisma.fxRate.upsert({
      where: { currency_asOf: { currency: country.defaultCurrency, asOf: FX_AS_OF } },
      update: { rateToUSD: FX_RATES_TO_USD[country.defaultCurrency]!.toString() },
      create: {
        countryId: row.id,
        currency: country.defaultCurrency,
        rateToUSD: FX_RATES_TO_USD[country.defaultCurrency]!.toString(),
        asOf: FX_AS_OF,
      },
    });
  }

  logger.info(
    `Reference data seeded: ${DEPARTMENTS.length} departments, ${COUNTRIES.length} countries + FX rates`
  );
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

const generateEmployees = (
  departmentIds: Map<string, string>,
  countryIds: Map<string, string>
): { employees: EmployeeSeed[]; salaryRecords: SalaryRecordSeed[] } => {
  const employees: EmployeeSeed[] = [];
  const salaryRecords: SalaryRecordSeed[] = [];

  for (let i = 0; i < EMPLOYEE_COUNT; i++) {
    const countryCode = weightedPick(COUNTRY_WEIGHTS);
    const department = weightedPick(DEPARTMENT_WEIGHTS);
    const jobLevel = weightedPick(LEVEL_WEIGHTS);
    const currency = COUNTRIES.find((c) => c.code === countryCode)!.defaultCurrency;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hireDate = faker.date.between({ from: '2015-01-01', to: '2025-06-01' });

    const employeeId = faker.string.uuid();
    employees.push({
      id: employeeId,
      employeeCode: `EMP-${String(i + 1).padStart(5, '0')}`,
      firstName,
      lastName,
      // index suffix guarantees uniqueness without a collision-retry loop
      email: `${firstName}.${lastName}.${i + 1}@acme-corp.com`
        .toLowerCase()
        .replace(/[^a-z0-9.@-]/g, ''),
      departmentId: departmentIds.get(department)!,
      countryId: countryIds.get(countryCode)!,
      jobLevel,
      status: faker.number.float({ min: 0, max: 1 }) < 0.96 ? 'ACTIVE' : 'INACTIVE',
      hireDate,
    });

    // 1–3 records: hire salary plus 0–2 raises (docs/TRADEOFFS.md §2), so the
    // history view and recent-changes feed aren't empty on a fresh seed
    const recordCount = weightedPick<number>([
      [1, 0.35],
      [2, 0.4],
      [3, 0.25],
    ]);

    let amount = sampleSalary(countryCode, jobLevel);
    let effectiveDate = hireDate;
    const records: Omit<SalaryRecordSeed, 'isCurrent'>[] = [];

    for (let r = 0; r < recordCount; r++) {
      records.push({
        employeeId,
        amount,
        currency,
        effectiveDate,
        reason:
          r === 0
            ? 'Hire salary'
            : RAISE_REASONS[
                Math.floor(faker.number.float({ min: 0, max: 1 }) * RAISE_REASONS.length)
              ]!,
      });

      // each raise: +4–12%, effective ~1 year later — but never beyond the
      // fixed cutoff (a fixed constant, not `new Date()`, so determinism
      // holds): a future-dated "raise" would look wrong in the
      // recent-changes feed
      amount = Math.round((amount * faker.number.float({ min: 1.04, max: 1.12 })) / 100) * 100;
      effectiveDate = new Date(
        effectiveDate.getTime() + faker.number.int({ min: 330, max: 420 }) * 86_400_000
      );
      if (effectiveDate > HISTORY_CUTOFF) {
        break;
      }
    }

    // only the latest surviving record is current
    records.forEach((record, index) =>
      salaryRecords.push({ ...record, isCurrent: index === records.length - 1 })
    );
  }

  return { employees, salaryRecords };
};

const insertInBatches = async <T>(
  label: string,
  rows: T[],
  insert: (chunk: T[]) => Promise<unknown>
): Promise<void> => {
  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    await insert(rows.slice(offset, offset + BATCH_SIZE));
  }
  logger.info(`${label}: ${rows.length} rows inserted in batches of ${BATCH_SIZE}`);
};

const seedEmployees = async (): Promise<void> => {
  const departments = await prisma.department.findMany();
  const countries = await prisma.country.findMany();
  const departmentIds = new Map(departments.map((d) => [d.name, d.id]));
  const countryIds = new Map(countries.map((c) => [c.code, c.id]));

  // Idempotency: wipe and regenerate (salary records go with employees via
  // the FK cascade) — `yarn prisma:seed` is always safe to re-run
  await prisma.employee.deleteMany();
  logger.info('Existing employees cleared');

  const { employees, salaryRecords } = generateEmployees(departmentIds, countryIds);

  await insertInBatches('Employees', employees, (chunk) =>
    prisma.employee.createMany({ data: chunk })
  );
  await insertInBatches('Salary records', salaryRecords, (chunk) =>
    prisma.salaryRecord.createMany({
      data: chunk.map((r) => ({ ...r, amount: r.amount.toString() })),
    })
  );
};

const main = async (): Promise<void> => {
  const started = Date.now();
  await seedReferenceData();
  await seedHrUser();
  await seedEmployees();
  logger.info(`Seed completed in ${((Date.now() - started) / 1000).toFixed(1)}s`);
};

main()
  .catch((error) => {
    logger.error('Seed failed', { error });
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
