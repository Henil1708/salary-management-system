import { stringify } from 'csv-stringify/sync';
import { CSV_IMPORT_HEADERS, EmployeeListQuery } from '@salary/shared';
import prisma from '@config/database';
import { buildEmployeeWhere } from '@services/employee.service';

/**
 * CSV export of the current filtered view (PRD scope). Reuses the directory's
 * where builder so the exported rows are exactly what the filtered list
 * shows, and emits the SAME columns the import accepts — an exported file
 * round-trips straight back through the bulk import.
 */
export const exportEmployeesCsv = async (query: EmployeeListQuery): Promise<string> => {
  const rows = await prisma.employee.findMany({
    where: buildEmployeeWhere(query),
    orderBy: { [query.sortBy]: query.sortOrder },
    select: {
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      jobLevel: true,
      status: true,
      hireDate: true,
      department: { select: { name: true } },
      country: { select: { code: true } },
      salaryRecords: {
        where: { isCurrent: true },
        take: 1,
        select: { amount: true, currency: true },
      },
    },
  });

  return stringify(
    rows.map((row) => ({
      employeeCode: row.employeeCode,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      department: row.department.name,
      countryCode: row.country.code,
      jobLevel: row.jobLevel,
      status: row.status,
      hireDate: row.hireDate.toISOString().slice(0, 10),
      salaryAmount: row.salaryRecords[0] ? Number(row.salaryRecords[0].amount) : '',
      salaryCurrency: row.salaryRecords[0]?.currency ?? '',
    })),
    { header: true, columns: [...CSV_IMPORT_HEADERS] }
  );
};
