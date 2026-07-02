import { DashboardDimension } from '@salary/shared';
import prisma from '@config/database';
import { Prisma } from '../generated/prisma/client';

// All aggregates are computed in SQL — GROUP BY/AVG/percentile_cont over the
// isCurrent ledger rows — never by pulling employees into the app layer
// (docs/TRADEOFFS.md §6). Cross-currency comparability comes from normalizing
// to USD via the latest FxRate per currency; aggregates cover ACTIVE
// employees (payroll cost of people actually on payroll).

// Latest rate per currency — today the seed writes one asOf, but the query
// stays correct when rates get refreshed later.
const FX_CTE = Prisma.sql`
  WITH fx AS (
    SELECT DISTINCT ON (currency) currency, "rateToUSD"
    FROM "FxRate"
    ORDER BY currency, "asOf" DESC
  )
`;

export interface DashboardSummary {
  headcount: number;
  activeHeadcount: number;
  totalPayrollCostUsd: number;
  averageSalaryUsd: number;
  medianSalaryUsd: number;
}

export const getSummary = async (): Promise<DashboardSummary> => {
  const [row] = await prisma.$queryRaw<[DashboardSummary]>`
    ${FX_CTE}
    SELECT
      (SELECT COUNT(*) FROM "Employee")::int                          AS "headcount",
      COUNT(*)::int                                                   AS "activeHeadcount",
      ROUND(SUM(sr.amount * fx."rateToUSD"))::float8                  AS "totalPayrollCostUsd",
      ROUND(AVG(sr.amount * fx."rateToUSD"))::float8                  AS "averageSalaryUsd",
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY sr.amount * fx."rateToUSD"))::float8                 AS "medianSalaryUsd"
    FROM "Employee" e
    JOIN "SalaryRecord" sr ON sr."employeeId" = e.id AND sr."isCurrent"
    JOIN fx ON fx.currency = sr.currency
    WHERE e.status = 'ACTIVE'
  `;
  return row;
};

export interface DimensionStat {
  key: string;
  headcount: number;
  averageSalaryUsd: number;
  medianSalaryUsd: number;
}

// The dimension arrives validated against the shared enum; each case maps to
// a static SQL fragment — nothing user-supplied is interpolated.
const DIMENSION_KEYS: Record<DashboardDimension, { select: Prisma.Sql; join: Prisma.Sql }> = {
  department: {
    select: Prisma.sql`d.name`,
    join: Prisma.sql`JOIN "Department" d ON d.id = e."departmentId"`,
  },
  country: {
    select: Prisma.sql`c.name`,
    join: Prisma.sql`JOIN "Country" c ON c.id = e."countryId"`,
  },
  jobLevel: {
    select: Prisma.sql`e."jobLevel"`,
    join: Prisma.sql``,
  },
};

export const getSalaryByDimension = async (
  dimension: DashboardDimension
): Promise<DimensionStat[]> => {
  const { select, join } = DIMENSION_KEYS[dimension];

  return prisma.$queryRaw<DimensionStat[]>`
    ${FX_CTE}
    SELECT
      ${select}                                                        AS "key",
      COUNT(*)::int                                                    AS "headcount",
      ROUND(AVG(sr.amount * fx."rateToUSD"))::float8                   AS "averageSalaryUsd",
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY sr.amount * fx."rateToUSD"))::float8                  AS "medianSalaryUsd"
    FROM "Employee" e
    JOIN "SalaryRecord" sr ON sr."employeeId" = e.id AND sr."isCurrent"
    JOIN fx ON fx.currency = sr.currency
    ${join}
    WHERE e.status = 'ACTIVE'
    GROUP BY ${select}
    ORDER BY "headcount" DESC
  `;
};

export interface PayBand {
  jobLevel: string;
  headcount: number;
  minUsd: number;
  p25Usd: number;
  medianUsd: number;
  p75Usd: number;
  maxUsd: number;
}

export const getPayBands = async (): Promise<PayBand[]> => {
  return prisma.$queryRaw<PayBand[]>`
    ${FX_CTE}
    SELECT
      e."jobLevel"                                                     AS "jobLevel",
      COUNT(*)::int                                                    AS "headcount",
      ROUND(MIN(sr.amount * fx."rateToUSD"))::float8                   AS "minUsd",
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (
        ORDER BY sr.amount * fx."rateToUSD"))::float8                  AS "p25Usd",
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY sr.amount * fx."rateToUSD"))::float8                  AS "medianUsd",
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (
        ORDER BY sr.amount * fx."rateToUSD"))::float8                  AS "p75Usd",
      ROUND(MAX(sr.amount * fx."rateToUSD"))::float8                   AS "maxUsd"
    FROM "Employee" e
    JOIN "SalaryRecord" sr ON sr."employeeId" = e.id AND sr."isCurrent"
    JOIN fx ON fx.currency = sr.currency
    WHERE e.status = 'ACTIVE'
    GROUP BY e."jobLevel"
    ORDER BY "medianUsd" DESC
  `;
};

export interface RecentChange {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  amount: number;
  currency: string;
  effectiveDate: Date;
  reason: string;
}

export const getRecentChanges = async (limit: number): Promise<RecentChange[]> => {
  const rows = await prisma.salaryRecord.findMany({
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
