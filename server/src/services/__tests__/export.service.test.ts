import { employeeListQuerySchema } from '@salary/shared';

jest.mock('@config/database', () => ({
  __esModule: true,
  default: {
    employee: { findMany: jest.fn() },
  },
}));

import prisma from '@config/database';
import { exportEmployeesCsv } from '@services/export.service';
import { buildEmployeeWhere } from '@services/employee.service';

const mockPrisma = prisma as unknown as { employee: { findMany: jest.Mock } };

beforeEach(() => jest.clearAllMocks());

describe('exportEmployeesCsv', () => {
  it('reuses the directory where builder and emits import-compatible columns', async () => {
    mockPrisma.employee.findMany.mockResolvedValue([
      {
        employeeCode: 'EMP-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@acme.com',
        jobLevel: 'Senior',
        status: 'ACTIVE',
        hireDate: new Date('2021-03-01T00:00:00Z'),
        department: { name: 'Engineering' },
        country: { code: 'US' },
        salaryRecords: [{ amount: '95000.00', currency: 'USD' }],
      },
    ]);

    const query = employeeListQuerySchema.parse({ department: 'Engineering', search: 'jane' });
    const output = await exportEmployeesCsv(query);

    // exact same filter semantics as GET /employees
    expect(mockPrisma.employee.findMany.mock.calls[0][0].where).toEqual(
      buildEmployeeWhere(query)
    );

    const [header, row] = output.trim().split('\n');
    expect(header).toBe(
      'employeeCode,firstName,lastName,email,department,countryCode,jobLevel,status,hireDate,salaryAmount,salaryCurrency'
    );
    // hireDate round-trips as YYYY-MM-DD; salary flattened from the ledger
    expect(row).toBe('EMP-1,Jane,Doe,jane@acme.com,Engineering,US,Senior,ACTIVE,2021-03-01,95000,USD');
  });

  it('leaves salary cells empty when an employee has no current record', async () => {
    mockPrisma.employee.findMany.mockResolvedValue([
      {
        employeeCode: 'EMP-2',
        firstName: 'No',
        lastName: 'Salary',
        email: 'no@acme.com',
        jobLevel: 'Junior',
        status: 'ACTIVE',
        hireDate: new Date('2024-01-01T00:00:00Z'),
        department: { name: 'Sales' },
        country: { code: 'US' },
        salaryRecords: [],
      },
    ]);

    const output = await exportEmployeesCsv(employeeListQuerySchema.parse({}));
    expect(output.trim().split('\n')[1]).toContain(',,');
  });
});
