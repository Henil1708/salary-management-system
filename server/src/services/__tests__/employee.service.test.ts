import { EmployeeListQuery, employeeListQuerySchema } from '@salary/shared';

jest.mock('@config/database', () => ({
  __esModule: true,
  default: {
    employee: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    department: { findUnique: jest.fn() },
    country: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import prisma from '@config/database';
import {
  buildEmployeeWhere,
  getEmployee,
  listEmployees,
} from '@services/employee.service';
import { NotFoundError } from '@utils/errors';

const mockPrisma = prisma as unknown as {
  employee: { findMany: jest.Mock; findUnique: jest.Mock; count: jest.Mock };
  $transaction: jest.Mock;
};

const query = (overrides: Partial<EmployeeListQuery> = {}): EmployeeListQuery =>
  ({ ...employeeListQuerySchema.parse({}), ...overrides });

const dbRow = {
  id: 'e1',
  employeeCode: 'EMP-0001',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@acme.com',
  jobLevel: 'Senior',
  status: 'ACTIVE',
  hireDate: new Date('2021-03-01'),
  department: { name: 'Engineering' },
  country: { code: 'DE', name: 'Germany' },
  salaryRecords: [
    { amount: '85000.00', currency: 'EUR', effectiveDate: new Date('2024-01-01') },
  ],
};

beforeEach(() => jest.clearAllMocks());

describe('buildEmployeeWhere', () => {
  it('returns an empty filter for a bare query', () => {
    expect(buildEmployeeWhere(query())).toEqual({});
  });

  it('searches across name, email and employee code, case-insensitively', () => {
    const where = buildEmployeeWhere(query({ search: 'jane' }));
    expect(where.OR).toHaveLength(4);
    expect(where.OR).toContainEqual({ email: { contains: 'jane', mode: 'insensitive' } });
    expect(where.OR).toContainEqual({ employeeCode: { contains: 'jane', mode: 'insensitive' } });
  });

  it('filters by relation keys and plain columns together', () => {
    const where = buildEmployeeWhere(
      query({ department: 'Sales', countryCode: 'US', jobLevel: 'Mid', status: 'ACTIVE' })
    );
    expect(where).toEqual({
      department: { name: 'Sales' },
      country: { code: 'US' },
      jobLevel: 'Mid',
      status: 'ACTIVE',
    });
  });
});

describe('listEmployees', () => {
  it('paginates server-side and maps rows to the flat DTO', async () => {
    mockPrisma.$transaction.mockResolvedValue([[dbRow], 41]);

    const result = await listEmployees(query({ page: 3, pageSize: 20 }));

    const findManyArgs = mockPrisma.employee.findMany.mock.calls[0][0];
    expect(findManyArgs.skip).toBe(40); // (page 3 - 1) * 20
    expect(findManyArgs.take).toBe(20);
    expect(findManyArgs.orderBy).toEqual({ lastName: 'asc' }); // schema defaults

    expect(result.total).toBe(41);
    expect(result.totalPages).toBe(3);
    expect(result.items[0]).toMatchObject({
      department: 'Engineering',
      countryCode: 'DE',
      currentSalary: { amount: 85000, currency: 'EUR' },
    });
  });

  it('passes the whitelisted sort column through', async () => {
    mockPrisma.$transaction.mockResolvedValue([[], 0]);
    await listEmployees(query({ sortBy: 'hireDate', sortOrder: 'desc' }));
    expect(mockPrisma.employee.findMany.mock.calls[0][0].orderBy).toEqual({ hireDate: 'desc' });
  });

  it('only ever fetches the current salary record', async () => {
    mockPrisma.$transaction.mockResolvedValue([[], 0]);
    await listEmployees(query());
    const select = mockPrisma.employee.findMany.mock.calls[0][0].select;
    expect(select.salaryRecords.where).toEqual({ isCurrent: true });
    expect(select.salaryRecords.take).toBe(1);
  });
});

describe('getEmployee', () => {
  it('maps a found employee, with null salary when no current record exists', async () => {
    mockPrisma.employee.findUnique.mockResolvedValue({ ...dbRow, salaryRecords: [] });
    const dto = await getEmployee('e1');
    expect(dto.currentSalary).toBeNull();
    expect(dto.countryName).toBe('Germany');
  });

  it('throws NOT_FOUND for an unknown id', async () => {
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    await expect(getEmployee('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});
