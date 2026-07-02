jest.mock('@config/database', () => ({
  __esModule: true,
  default: {
    department: { findMany: jest.fn() },
    country: { findMany: jest.fn() },
    employee: { findMany: jest.fn(), createMany: jest.fn(), update: jest.fn() },
    salaryRecord: { createMany: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn().mockResolvedValue([]),
  },
}));

import prisma from '@config/database';
import { importEmployeesCsv } from '@services/csv-import.service';

const mockPrisma = prisma as unknown as {
  department: { findMany: jest.Mock };
  country: { findMany: jest.Mock };
  employee: { findMany: jest.Mock; createMany: jest.Mock; update: jest.Mock };
  salaryRecord: { createMany: jest.Mock; updateMany: jest.Mock };
  $transaction: jest.Mock;
};

const HEADER =
  'employeeCode,firstName,lastName,email,department,countryCode,jobLevel,status,hireDate,salaryAmount,salaryCurrency';

const csv = (...rows: string[]): Buffer => Buffer.from([HEADER, ...rows].join('\n'));

const existingJane = {
  id: 'e-jane',
  email: 'jane@acme.com',
  employeeCode: 'EMP-1',
  firstName: 'Jane',
  lastName: 'Doe',
  departmentId: 'd-eng',
  countryId: 'c-us',
  jobLevel: 'Senior',
  status: 'ACTIVE',
  hireDate: new Date('2021-03-01'),
  salaryRecords: [{ amount: '90000', currency: 'USD' }],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.$transaction.mockResolvedValue([]);
  mockPrisma.department.findMany.mockResolvedValue([{ id: 'd-eng', name: 'Engineering' }]);
  mockPrisma.country.findMany.mockResolvedValue([{ id: 'c-us', code: 'US' }]);
  mockPrisma.employee.findMany.mockResolvedValue([]);
});

describe('importEmployeesCsv', () => {
  it('commits valid rows and reports invalid ones — partial success, never all-or-nothing', async () => {
    const result = await importEmployeesCsv(
      csv(
        'N-1,Alice,Wonder,alice@acme.com,Engineering,US,Senior,ACTIVE,2023-05-01,145000,USD',
        'N-2,Carol,Nosalary,carol@acme.com,Engineering,US,Junior,ACTIVE,2024-01-10,,USD'
      ),
      'en'
    );

    expect(result).toMatchObject({ imported: 1, updated: 0, unchanged: 0, rejected: 1 });
    // the valid row was still committed despite the broken one
    const created = mockPrisma.employee.createMany.mock.calls[0][0].data;
    expect(created).toHaveLength(1);
    expect(created[0].email).toBe('alice@acme.com');
    // salary lands as a string with isCurrent
    const salary = mockPrisma.salaryRecord.createMany.mock.calls[0][0].data[0];
    expect(salary).toMatchObject({ amount: '145000', isCurrent: true });
  });

  it('translates rejected reasons into the report CSV (same columns + reason)', async () => {
    const result = await importEmployeesCsv(
      csv('N-2,Carol,Nosalary,carol@acme.com,Engineering,US,Junior,ACTIVE,2024-01-10,,USD'),
      'en'
    );

    expect(result.rejectedCsv).toContain(`${HEADER},reason`);
    expect(result.rejectedCsv).toContain('Invalid or missing salary');
    expect(result.rejectedCsv).not.toContain('errors.validation'); // keys never leak into the file
  });

  it('keeps the LAST duplicate in-file and reports the EARLIER row as superseded', async () => {
    const result = await importEmployeesCsv(
      csv(
        'N-5,Eve,First,eve@acme.com,Engineering,US,Senior,ACTIVE,2021-02-01,99000,USD',
        'N-5,Eve,Corrected,eve@acme.com,Engineering,US,Senior,ACTIVE,2021-02-01,102000,USD'
      ),
      'en'
    );

    expect(result).toMatchObject({ imported: 1, rejected: 1 });
    const created = mockPrisma.employee.createMany.mock.calls[0][0].data[0];
    expect(created.lastName).toBe('Corrected'); // last occurrence wins
    expect(result.rejectedCsv).toContain('First'); // the earlier row is what's reported
    expect(result.rejectedCsv).toContain('Superseded by a later row with the same email');
  });

  it('treats an existing email as an update and appends a ledger revision on salary change', async () => {
    mockPrisma.employee.findMany.mockResolvedValue([existingJane]);

    const result = await importEmployeesCsv(
      csv('EMP-1,Jane,Doe,jane@acme.com,Engineering,US,Senior,ACTIVE,2021-03-01,95000,USD'),
      'en'
    );

    expect(result).toMatchObject({ imported: 0, updated: 1, unchanged: 0 });
    // ledger: demote current, append new — same invariant as the salary endpoint
    expect(mockPrisma.salaryRecord.updateMany).toHaveBeenCalledWith({
      where: { employeeId: { in: ['e-jane'] }, isCurrent: true },
      data: { isCurrent: false },
    });
    const revision = mockPrisma.salaryRecord.createMany.mock.calls[1][0].data[0];
    expect(revision).toMatchObject({ employeeId: 'e-jane', amount: '95000', isCurrent: true });
  });

  it('detects fully unchanged rows and writes nothing', async () => {
    mockPrisma.employee.findMany.mockResolvedValue([existingJane]);

    const result = await importEmployeesCsv(
      csv('EMP-1,Jane,Doe,jane@acme.com,Engineering,US,Senior,ACTIVE,2021-03-01,90000,USD'),
      'en'
    );

    expect(result).toMatchObject({ imported: 0, updated: 0, unchanged: 1, rejected: 0 });
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a file with missing columns up front', async () => {
    await expect(
      importEmployeesCsv(Buffer.from('name,salary\nfoo,1'), 'en')
    ).rejects.toMatchObject({ code: 'IMPORT_INVALID_HEADERS', statusCode: 400 });
  });
});
