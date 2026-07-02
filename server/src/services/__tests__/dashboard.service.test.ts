jest.mock('@config/database', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
    salaryRecord: { findMany: jest.fn() },
  },
}));

import prisma from '@config/database';
import {
  getRecentChanges,
  getSalaryByDimension,
  getSummary,
} from '@services/dashboard.service';

const mockPrisma = prisma as unknown as {
  $queryRaw: jest.Mock;
  salaryRecord: { findMany: jest.Mock };
};

// $queryRaw is a tagged template: calls arrive as (strings[], ...values).
// Flatten every string fragment (including nested Prisma.sql fragments in the
// values) so assertions can check what SQL actually went to the database.
const rawSqlOfCall = (call: unknown[]): string => {
  const collect = (part: unknown): string => {
    if (Array.isArray(part)) return part.map(collect).join(' ');
    if (part && typeof part === 'object') {
      const sql = part as { strings?: string[]; values?: unknown[] };
      return [...(sql.strings ?? []), ...(sql.values ?? []).map(collect)].join(' ');
    }
    return typeof part === 'string' ? part : '';
  };
  return call.map(collect).join(' ');
};

beforeEach(() => jest.clearAllMocks());

describe('getSummary', () => {
  it('computes everything in one SQL statement over isCurrent rows', async () => {
    const row = {
      headcount: 10000,
      activeHeadcount: 9580,
      totalPayrollCostUsd: 678769545,
      averageSalaryUsd: 70853,
      medianSalaryUsd: 64400,
    };
    mockPrisma.$queryRaw.mockResolvedValue([row]);

    await expect(getSummary()).resolves.toEqual(row);

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    const sql = rawSqlOfCall(mockPrisma.$queryRaw.mock.calls[0]!);
    expect(sql).toContain('"isCurrent"');
    expect(sql).toContain('PERCENTILE_CONT(0.5)');
    expect(sql).toContain('"rateToUSD"'); // normalized via the FX table
    expect(sql).toContain(`status = 'ACTIVE'`);
  });
});

describe('getSalaryByDimension', () => {
  it.each([
    ['department', '"Department"'],
    ['country', '"Country"'],
    ['jobLevel', '"jobLevel"'],
  ] as const)('dimension %s groups by its static SQL fragment', async (dimension, fragment) => {
    mockPrisma.$queryRaw.mockResolvedValue([]);
    await getSalaryByDimension(dimension);
    expect(rawSqlOfCall(mockPrisma.$queryRaw.mock.calls[0]!)).toContain(fragment);
  });
});

describe('getRecentChanges', () => {
  it('orders by effectiveDate desc, applies the limit and flattens the employee', async () => {
    mockPrisma.salaryRecord.findMany.mockResolvedValue([
      {
        amount: '87700.00',
        currency: 'EUR',
        effectiveDate: new Date('2026-06-28'),
        reason: 'Promotion',
        employee: { id: 'e1', employeeCode: 'EMP-00042', firstName: 'Barry', lastName: 'Reilly' },
      },
    ]);

    const changes = await getRecentChanges(3);

    const args = mockPrisma.salaryRecord.findMany.mock.calls[0][0];
    expect(args.take).toBe(3);
    expect(args.orderBy).toEqual([{ effectiveDate: 'desc' }, { createdAt: 'desc' }]);

    expect(changes[0]).toEqual({
      employeeId: 'e1',
      employeeCode: 'EMP-00042',
      firstName: 'Barry',
      lastName: 'Reilly',
      amount: 87700,
      currency: 'EUR',
      effectiveDate: new Date('2026-06-28'),
      reason: 'Promotion',
    });
  });
});
