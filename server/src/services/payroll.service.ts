import {
  PayrollItemDto,
  PayrollItemsQuery,
  PayrollRunDetailDto,
  PayrollRunSummaryDto,
  PayrollStatus,
} from '@salary/shared';
import prisma from '@config/database';
import { Prisma } from '../generated/prisma/client';
import { ConflictError, NotFoundError } from '@utils/errors';

// Item filters (name/department/USD range) shared by the list and pay-all, so
// "mark all paid" pays exactly the rows the HR manager is looking at.
const buildItemWhere = (
  runId: string,
  filters: Pick<PayrollItemsQuery, 'search' | 'department' | 'minUsd' | 'maxUsd'>
): Prisma.PayrollItemWhereInput => {
  const where: Prisma.PayrollItemWhereInput = { payrollRunId: runId };
  const employee: Prisma.EmployeeWhereInput = {};

  if (filters.search) {
    employee.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { employeeCode: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.department) {
    employee.department = { name: filters.department };
  }
  if (Object.keys(employee).length > 0) {
    where.employee = employee;
  }
  if (filters.minUsd !== undefined || filters.maxUsd !== undefined) {
    where.amountUsd = {
      ...(filters.minUsd !== undefined && { gte: filters.minUsd }),
      ...(filters.maxUsd !== undefined && { lte: filters.maxUsd }),
    };
  }
  return where;
};

const ITEM_INSERT_CHUNK = 1_000;

const deriveStatus = (itemCount: number, paidCount: number): PayrollStatus => {
  if (itemCount === 0 || paidCount === 0) {
    return 'PENDING';
  }
  return paidCount === itemCount ? 'PAID' : 'PROCESSING';
};

// Per-run totals/counts computed in SQL (one grouped query for the whole list).
interface RunAggregate {
  itemCount: number;
  paidCount: number;
  totalUsd: number;
  paidUsd: number;
}

const aggregateRuns = async (runIds: string[]): Promise<Map<string, RunAggregate>> => {
  if (runIds.length === 0) {
    return new Map();
  }
  const rows = await prisma.$queryRaw<
    Array<{ runId: string; itemCount: bigint; paidCount: bigint; totalUsd: number; paidUsd: number }>
  >`
    SELECT
      "payrollRunId"                                              AS "runId",
      COUNT(*)                                                    AS "itemCount",
      COUNT(*) FILTER (WHERE status = 'PAID')                     AS "paidCount",
      COALESCE(SUM("amountUsd"), 0)::float8                       AS "totalUsd",
      COALESCE(SUM("amountUsd") FILTER (WHERE status = 'PAID'), 0)::float8 AS "paidUsd"
    FROM "PayrollItem"
    WHERE "payrollRunId" IN (${Prisma.join(runIds)})
    GROUP BY "payrollRunId"
  `;
  return new Map(
    rows.map((r) => [
      r.runId,
      {
        itemCount: Number(r.itemCount),
        paidCount: Number(r.paidCount),
        totalUsd: r.totalUsd,
        paidUsd: r.paidUsd,
      },
    ])
  );
};

const toSummary = (
  run: { id: string; period: string; status: string; createdAt: Date },
  agg: RunAggregate | undefined
): PayrollRunSummaryDto => ({
  id: run.id,
  period: run.period,
  status: run.status as PayrollStatus,
  itemCount: agg?.itemCount ?? 0,
  paidCount: agg?.paidCount ?? 0,
  totalUsd: agg?.totalUsd ?? 0,
  paidUsd: agg?.paidUsd ?? 0,
  createdAt: run.createdAt,
});

export const listPayrollRuns = async (): Promise<PayrollRunSummaryDto[]> => {
  const runs = await prisma.payrollRun.findMany({ orderBy: { period: 'desc' } });
  const agg = await aggregateRuns(runs.map((r) => r.id));
  return runs.map((run) => toSummary(run, agg.get(run.id)));
};

/**
 * Snapshot every active employee's current salary (normalized to USD) into a
 * new run's line items. The period is unique — a second run for the same
 * month is rejected.
 */
export const createPayrollRun = async (period: string): Promise<PayrollRunSummaryDto> => {
  const existing = await prisma.payrollRun.findUnique({ where: { period } });
  if (existing) {
    throw new ConflictError('Payroll run already exists for this period', 'PAYROLL_PERIOD_EXISTS');
  }

  const snapshot = await prisma.$queryRaw<
    Array<{ employeeId: string; amount: string; currency: string; amountUsd: number }>
  >`
    WITH fx AS (
      SELECT DISTINCT ON (currency) currency, "rateToUSD"
      FROM "FxRate" ORDER BY currency, "asOf" DESC
    )
    SELECT e.id AS "employeeId", sr.amount::text AS "amount", sr.currency AS "currency",
           ROUND(sr.amount * fx."rateToUSD", 2)::float8 AS "amountUsd"
    FROM "Employee" e
    JOIN "SalaryRecord" sr ON sr."employeeId" = e.id AND sr."isCurrent"
    JOIN fx ON fx.currency = sr.currency
    WHERE e.status = 'ACTIVE'
  `;

  const run = await prisma.payrollRun.create({ data: { period, status: 'PENDING' } });

  for (let offset = 0; offset < snapshot.length; offset += ITEM_INSERT_CHUNK) {
    await prisma.payrollItem.createMany({
      data: snapshot.slice(offset, offset + ITEM_INSERT_CHUNK).map((row) => ({
        payrollRunId: run.id,
        employeeId: row.employeeId,
        amount: row.amount,
        currency: row.currency,
        amountUsd: row.amountUsd.toFixed(2),
      })),
    });
  }

  const agg = await aggregateRuns([run.id]);
  return toSummary(run, agg.get(run.id));
};

const toItemDto = (row: {
  id: string;
  employeeId: string;
  amount: unknown;
  currency: string;
  amountUsd: unknown;
  status: string;
  paidAt: Date | null;
  employee: { employeeCode: string; firstName: string; lastName: string; department: { name: string } };
}): PayrollItemDto => ({
  id: row.id,
  employeeId: row.employeeId,
  employeeCode: row.employee.employeeCode,
  firstName: row.employee.firstName,
  lastName: row.employee.lastName,
  department: row.employee.department.name,
  amount: Number(row.amount),
  currency: row.currency,
  amountUsd: Number(row.amountUsd),
  status: row.status as PayrollItemDto['status'],
  paidAt: row.paidAt,
});

export const getPayrollRun = async (
  id: string,
  query: PayrollItemsQuery
): Promise<PayrollRunDetailDto> => {
  const run = await prisma.payrollRun.findUnique({ where: { id } });
  if (!run) {
    throw new NotFoundError('Payroll run not found', 'PAYROLL_RUN_NOT_FOUND');
  }

  const { page, pageSize } = query;
  // Filtered where drives the items list + its total; the run summary stays
  // full-run (aggregateRuns) so headline counts don't shift with filters.
  const where = buildItemWhere(id, query);

  const [rows, total, agg] = await Promise.all([
    prisma.payrollItem.findMany({
      where,
      orderBy: [{ status: 'asc' }, { amountUsd: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        employeeId: true,
        amount: true,
        currency: true,
        amountUsd: true,
        status: true,
        paidAt: true,
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
    prisma.payrollItem.count({ where }),
    aggregateRuns([id]),
  ]);

  return {
    run: toSummary(run, agg.get(id)),
    items: {
      items: rows.map(toItemDto),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// Recompute and persist the run's rolled-up status after any pay change.
const refreshRunStatus = async (runId: string): Promise<void> => {
  const [itemCount, paidCount] = await Promise.all([
    prisma.payrollItem.count({ where: { payrollRunId: runId } }),
    prisma.payrollItem.count({ where: { payrollRunId: runId, status: 'PAID' } }),
  ]);
  await prisma.payrollRun.update({
    where: { id: runId },
    data: { status: deriveStatus(itemCount, paidCount) },
  });
};

export const setItemPaid = async (
  runId: string,
  itemId: string,
  paid: boolean
): Promise<void> => {
  const item = await prisma.payrollItem.findFirst({ where: { id: itemId, payrollRunId: runId } });
  if (!item) {
    throw new NotFoundError('Payroll item not found', 'PAYROLL_RUN_NOT_FOUND');
  }
  await prisma.payrollItem.update({
    where: { id: itemId },
    data: { status: paid ? 'PAID' : 'PENDING', paidAt: paid ? new Date() : null },
  });
  await refreshRunStatus(runId);
};

// Marks paid only the PENDING items matching the current filters (so it acts
// on the filtered view, not the whole run), then re-derives the run status.
export const payAll = async (
  runId: string,
  filters: Pick<PayrollItemsQuery, 'search' | 'department' | 'minUsd' | 'maxUsd'>
): Promise<void> => {
  const run = await prisma.payrollRun.findUnique({ where: { id: runId } });
  if (!run) {
    throw new NotFoundError('Payroll run not found', 'PAYROLL_RUN_NOT_FOUND');
  }
  await prisma.payrollItem.updateMany({
    where: { ...buildItemWhere(runId, filters), status: 'PENDING' },
    data: { status: 'PAID', paidAt: new Date() },
  });
  await refreshRunStatus(runId);
};
