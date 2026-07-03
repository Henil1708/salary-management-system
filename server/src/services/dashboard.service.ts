import {
  DashboardDimension,
  DashboardSummary,
  DimensionStat,
  PayBand,
  PayrollTrendPoint,
  RecentChange,
} from '@salary/shared';
import prisma from '@config/database';
import { Prisma } from '../generated/prisma/client';

// All aggregates are computed in SQL (docs/TRADEOFFS.md §6), never pulled into
// the app layer. Everything is point-in-time "as of" a date (default now):
// the `pop` CTE is the set of currently-active employees with the salary in
// effect at `asOf` (latest SalaryRecord with effectiveDate ≤ asOf),
// normalized to USD via the latest FxRate per currency. As-of "today" this
// reduces to the current (isCurrent) salaries.
//
// Caveat: we don't track employment status history, so "active as of a past
// date" uses currently-active employees hired on/before that date — a proxy.

const resolveAsOf = (asOf?: Date): Date => asOf ?? new Date();

// WITH fx + pop(asOf). The trailing comma lets callers append their own CTEs.
const withPopulation = (asOf: Date): Prisma.Sql => Prisma.sql`
  WITH fx AS (
    SELECT DISTINCT ON (currency) currency, "rateToUSD"
    FROM "FxRate" ORDER BY currency, "asOf" DESC
  ),
  pop AS (
    SELECT e.id, e."departmentId", e."countryId", e."jobLevel",
           s.amount * fx."rateToUSD" AS amount_usd
    FROM "Employee" e
    JOIN LATERAL (
      SELECT sr.amount, sr.currency
      FROM "SalaryRecord" sr
      WHERE sr."employeeId" = e.id AND sr."effectiveDate" <= ${asOf}
      ORDER BY sr."effectiveDate" DESC
      LIMIT 1
    ) s ON true
    JOIN fx ON fx.currency = s.currency
    WHERE e.status = 'ACTIVE'
  )
`;

export const getSummary = async (asOf?: Date): Promise<DashboardSummary> => {
  const at = resolveAsOf(asOf);
  const [row] = await prisma.$queryRaw<[DashboardSummary]>`
    ${withPopulation(at)}
    SELECT
      (SELECT COUNT(*) FROM "Employee" WHERE "hireDate" <= ${at})::int AS "headcount",
      (SELECT COUNT(*) FROM pop)::int                                  AS "activeHeadcount",
      COALESCE(ROUND(SUM(amount_usd)), 0)::float8                      AS "totalPayrollCostUsd",
      COALESCE(ROUND(AVG(amount_usd)), 0)::float8                      AS "averageSalaryUsd",
      COALESCE(ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_usd)), 0)::float8
                                                                      AS "medianSalaryUsd"
    FROM pop
  `;
  return row;
};

// The dimension arrives validated against the shared enum; each case maps to
// a static SQL fragment — nothing user-supplied is interpolated.
const DIMENSION_KEYS: Record<DashboardDimension, { select: Prisma.Sql; join: Prisma.Sql }> = {
  department: {
    select: Prisma.sql`d.name`,
    join: Prisma.sql`JOIN "Department" d ON d.id = pop."departmentId"`,
  },
  country: {
    select: Prisma.sql`c.name`,
    join: Prisma.sql`JOIN "Country" c ON c.id = pop."countryId"`,
  },
  jobLevel: {
    select: Prisma.sql`pop."jobLevel"`,
    join: Prisma.sql``,
  },
};

export const getSalaryByDimension = async (
  dimension: DashboardDimension,
  asOf?: Date
): Promise<DimensionStat[]> => {
  const { select, join } = DIMENSION_KEYS[dimension];
  return prisma.$queryRaw<DimensionStat[]>`
    ${withPopulation(resolveAsOf(asOf))}
    SELECT
      ${select}                                                        AS "key",
      COUNT(*)::int                                                    AS "headcount",
      ROUND(AVG(amount_usd))::float8                                   AS "averageSalaryUsd",
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_usd))::float8 AS "medianSalaryUsd"
    FROM pop
    ${join}
    GROUP BY ${select}
    ORDER BY "headcount" DESC
  `;
};

export const getPayBands = async (asOf?: Date): Promise<PayBand[]> => {
  return prisma.$queryRaw<PayBand[]>`
    ${withPopulation(resolveAsOf(asOf))}
    SELECT
      pop."jobLevel"                                                   AS "jobLevel",
      COUNT(*)::int                                                    AS "headcount",
      ROUND(MIN(amount_usd))::float8                                   AS "minUsd",
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY amount_usd))::float8 AS "p25Usd",
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_usd))::float8  AS "medianUsd",
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY amount_usd))::float8 AS "p75Usd",
      ROUND(MAX(amount_usd))::float8                                   AS "maxUsd"
    FROM pop
    GROUP BY pop."jobLevel"
    ORDER BY "medianUsd" DESC
  `;
};

/**
 * Monthly payroll cost for the 12 months ending at `asOf` — each month's
 * value is the payroll in effect at that month's end (LATERAL as-of join),
 * normalized to USD. Backed by the (employeeId, effectiveDate) index.
 */
export const getPayrollTrend = async (asOf?: Date, months = 12): Promise<PayrollTrendPoint[]> => {
  const at = resolveAsOf(asOf);
  return prisma.$queryRaw<PayrollTrendPoint[]>`
    WITH fx AS (
      SELECT DISTINCT ON (currency) currency, "rateToUSD"
      FROM "FxRate" ORDER BY currency, "asOf" DESC
    ),
    series AS (
      SELECT generate_series(
        date_trunc('month', ${at}::date) - make_interval(months => ${months - 1}),
        date_trunc('month', ${at}::date),
        interval '1 month'
      ) AS month
    )
    SELECT
      to_char(s.month, 'YYYY-MM')                       AS "month",
      COALESCE(ROUND(SUM(asof.amount * fx."rateToUSD")), 0)::float8 AS "payrollUsd"
    FROM series s
    JOIN "Employee" e ON e.status = 'ACTIVE'
    JOIN LATERAL (
      SELECT sr.amount, sr.currency
      FROM "SalaryRecord" sr
      WHERE sr."employeeId" = e.id
        AND sr."effectiveDate" < (s.month + interval '1 month')
      ORDER BY sr."effectiveDate" DESC
      LIMIT 1
    ) asof ON true
    JOIN fx ON fx.currency = asof.currency
    GROUP BY s.month
    ORDER BY s.month
  `;
};

// Salary changes within an optional [start, end] window, newest first.
export const getRecentChanges = async (
  limit: number,
  start?: Date,
  end?: Date
): Promise<RecentChange[]> => {
  const effectiveDate: Prisma.DateTimeFilter = {};
  if (start) effectiveDate.gte = start;
  if (end) effectiveDate.lte = end;

  const rows = await prisma.salaryRecord.findMany({
    where: start || end ? { effectiveDate } : undefined,
    orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      amount: true,
      currency: true,
      effectiveDate: true,
      reason: true,
      employee: {
        select: { id: true, employeeCode: true, firstName: true, lastName: true },
      },
    },
  });

  return rows.map((row) => ({
    employeeId: row.employee.id,
    employeeCode: row.employee.employeeCode,
    firstName: row.employee.firstName,
    lastName: row.employee.lastName,
    amount: Number(row.amount),
    currency: row.currency,
    effectiveDate: row.effectiveDate,
    reason: row.reason,
  }));
};
