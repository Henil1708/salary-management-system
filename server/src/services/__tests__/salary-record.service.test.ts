jest.mock('@config/database', () => ({
  __esModule: true,
  default: {
    employee: { findUnique: jest.fn() },
    salaryRecord: { findMany: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import prisma from '@config/database';
import { addSalaryRecord, getHistory } from '@services/salary-record.service';
import { NotFoundError } from '@utils/errors';

const mockPrisma = prisma as unknown as {
  employee: { findUnique: jest.Mock };
  salaryRecord: { findMany: jest.Mock; updateMany: jest.Mock; create: jest.Mock };
  $transaction: jest.Mock;
};

const input = {
  amount: 85000.5,
  currency: 'EUR' as const,
  effectiveDate: new Date('2024-01-01'),
  reason: 'Annual raise',
};

const createdRow = {
  id: 'sr2',
  amount: '85000.50',
  currency: 'EUR',
  effectiveDate: new Date('2024-01-01'),
  reason: 'Annual raise',
  isCurrent: true,
  createdAt: new Date('2024-01-02'),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.employee.findUnique.mockResolvedValue({ id: 'e1' });
  mockPrisma.$transaction.mockResolvedValue([{ count: 1 }, createdRow]);
});

describe('addSalaryRecord', () => {
  it('demotes the previous current record and creates the new one in ONE transaction', async () => {
    await addSalaryRecord('e1', input);

    // both writes travel in the same $transaction call — the ledger can never
    // end up with zero or two current records (docs/TRADEOFFS.md §1)
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

    expect(mockPrisma.salaryRecord.updateMany).toHaveBeenCalledWith({
      where: { employeeId: 'e1', isCurrent: true },
      data: { isCurrent: false },
    });

    const createArgs = mockPrisma.salaryRecord.create.mock.calls[0][0].data;
    expect(createArgs.isCurrent).toBe(true);
    expect(createArgs.employeeId).toBe('e1');
  });

  it('writes the amount as a string — no float representation (docs/TRADEOFFS.md §1)', async () => {
    await addSalaryRecord('e1', input);
    const createArgs = mockPrisma.salaryRecord.create.mock.calls[0][0].data;
    expect(typeof createArgs.amount).toBe('string');
    expect(createArgs.amount).toBe('85000.5');
  });

  it('returns the created record as a DTO with a numeric amount', async () => {
    const dto = await addSalaryRecord('e1', input);
    expect(dto).toMatchObject({ id: 'sr2', amount: 85000.5, isCurrent: true });
  });

  it('rejects an unknown employee before touching the ledger', async () => {
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    await expect(addSalaryRecord('missing', input)).rejects.toBeInstanceOf(NotFoundError);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('getHistory', () => {
  it('orders by effectiveDate desc, then createdAt desc as tiebreaker', async () => {
    mockPrisma.salaryRecord.findMany.mockResolvedValue([createdRow]);

    const history = await getHistory('e1');

    expect(mockPrisma.salaryRecord.findMany).toHaveBeenCalledWith({
      where: { employeeId: 'e1' },
      orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
    });
    expect(history[0]!.amount).toBe(85000.5);
  });

  it('404s for an unknown employee', async () => {
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    await expect(getHistory('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
