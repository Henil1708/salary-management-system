import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify/sync';
import { CSV_IMPORT_HEADERS, CsvRowInput, SupportedLocale, csvRowSchema } from '@salary/shared';
import prisma from '@config/database';
import { BadRequestError } from '@utils/errors';
import { translate } from '@utils/i18n';
import logger from '@utils/logger';

export interface ImportResult {
  imported: number;
  updated: number;
  /** Rows matching an existing employee with nothing changed — skipped, not written */
  unchanged: number;
  rejected: number;
  /** Input-shaped CSV of rejected rows + a translated `reason` column — null when nothing was rejected. */
  rejectedCsv: string | null;
}

interface RejectedRow {
  raw: Record<string, string>;
  reasonKeys: string[];
}

interface ValidRow {
  data: CsvRowInput;
  /** The original raw record — echoed back verbatim in the rejected report */
  raw: Record<string, string>;
}

interface ParsedFile {
  validRows: ValidRow[];
  rejected: RejectedRow[];
}

const REQUIRED_HEADERS = new Set<string>(CSV_IMPORT_HEADERS);

/**
 * Pass 1 (docs/TRADEOFFS.md §3): stream-parse and validate every row
 * independently against the shared csvRowSchema — the database is not
 * touched until the whole file has been read.
 */
const parseAndValidate = async (fileBuffer: Buffer): Promise<ParsedFile> => {
  const parser = Readable.from(fileBuffer).pipe(
    parse({ columns: true, bom: true, trim: true, skip_empty_lines: true })
  );

  const validRows: ValidRow[] = [];
  const rejected: RejectedRow[] = [];
  let headersChecked = false;

  for await (const record of parser as AsyncIterable<Record<string, string>>) {
    if (!headersChecked) {
      const missing = [...REQUIRED_HEADERS].filter((h) => !(h in record));
      if (missing.length > 0) {
        throw new BadRequestError(
          `CSV is missing required columns: ${missing.join(', ')}`,
          'IMPORT_INVALID_HEADERS'
        );
      }
      headersChecked = true;
    }

    const result = csvRowSchema.safeParse(record);
    if (result.success) {
      validRows.push({ data: result.data, raw: record });
    } else {
      rejected.push({
        raw: record,
        reasonKeys: [...new Set(result.error.issues.map((issue) => issue.message))],
      });
    }
  }

  return { validRows, rejected };
};

/**
 * Duplicate emails within the same file keep the LAST occurrence — re-uploads
 * and corrections are the normal case, not an error (docs/TRADEOFFS.md §3).
 * Earlier occurrences land in the report flagged as superseded.
 */
const dedupeKeepLast = (rows: ValidRow[], rejected: RejectedRow[]): CsvRowInput[] => {
  const lastIndexByEmail = new Map<string, number>();
  rows.forEach((row, index) => lastIndexByEmail.set(row.data.email.toLowerCase(), index));

  return rows
    .filter((row, index) => {
      if (lastIndexByEmail.get(row.data.email.toLowerCase()) === index) {
        return true;
      }
      rejected.push({
        raw: row.raw,
        reasonKeys: ['errors.validation.common.supersededInFile'],
      });
      return false;
    })
    .map((row) => row.data);
};

/**
 * Pass 2: commit all valid rows in ONE transaction — partial success by
 * design; a broken row never rolls back the good ones because it was
 * filtered out before this point. Existing employees (matched by email) are
 * updated; a changed amount/currency appends a ledger revision via the same
 * demote-then-create pattern as the salary endpoint.
 */
// Statements per transaction — bounds transaction duration against the
// remote database while a chunk still commits or fails as a unit
const WRITE_CHUNK_SIZE = 200;
const TRANSACTION_TIMEOUT_MS = 60_000;

type ExistingEmployee = {
  id: string;
  email: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  countryId: string;
  jobLevel: string;
  status: string;
  hireDate: Date;
  salaryRecords: Array<{ amount: unknown; currency: string }>;
};

const isEmployeeChanged = (
  row: CsvRowInput,
  existing: ExistingEmployee,
  departmentId: string,
  countryId: string
): boolean =>
  existing.employeeCode !== row.employeeCode ||
  existing.firstName !== row.firstName ||
  existing.lastName !== row.lastName ||
  existing.departmentId !== departmentId ||
  existing.countryId !== countryId ||
  existing.jobLevel !== row.jobLevel ||
  existing.status !== row.status ||
  existing.hireDate.toISOString().slice(0, 10) !== row.hireDate.toISOString().slice(0, 10);

const isSalaryChanged = (row: CsvRowInput, existing: ExistingEmployee): boolean => {
  const current = existing.salaryRecords[0];
  return (
    !current || Number(current.amount) !== row.salaryAmount || current.currency !== row.salaryCurrency
  );
};

const commitRows = async (
  rows: CsvRowInput[]
): Promise<{ imported: number; updated: number; unchanged: number }> => {
  if (rows.length === 0) {
    return { imported: 0, updated: 0, unchanged: 0 };
  }

  const [departments, countries, existing] = await Promise.all([
    prisma.department.findMany(),
    prisma.country.findMany(),
    prisma.employee.findMany({
      where: { email: { in: rows.map((r) => r.email) } },
      select: {
        id: true,
        email: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        countryId: true,
        jobLevel: true,
        status: true,
        hireDate: true,
        salaryRecords: {
          where: { isCurrent: true },
          take: 1,
          select: { amount: true, currency: true },
        },
      },
    }),
  ]);
  const departmentIds = new Map(departments.map((d) => [d.name, d.id]));
  const countryIds = new Map(countries.map((c) => [c.code, c.id]));
  const existingByEmail = new Map(existing.map((e) => [e.email.toLowerCase(), e]));

  const creates = rows.filter((r) => !existingByEmail.has(r.email.toLowerCase()));
  // No-op detection: a row that matches an existing employee with identical
  // fields AND identical salary writes nothing — re-importing an exported
  // file is (nearly) free instead of 10,000 pointless UPDATEs
  const matches = rows.filter((r) => existingByEmail.has(r.email.toLowerCase()));
  const updates = matches.filter((row) => {
    const current = existingByEmail.get(row.email.toLowerCase())!;
    return (
      isEmployeeChanged(
        row,
        current,
        departmentIds.get(row.department)!,
        countryIds.get(row.countryCode)!
      ) || isSalaryChanged(row, current)
    );
  });
  const unchanged = matches.length - updates.length;

  const newEmployees = creates.map((row) => ({
    id: randomUUID(),
    employeeCode: row.employeeCode,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    departmentId: departmentIds.get(row.department)!,
    countryId: countryIds.get(row.countryCode)!,
    jobLevel: row.jobLevel,
    status: row.status,
    hireDate: row.hireDate,
  }));

  const newSalaryRecords = creates.map((row, index) => ({
    employeeId: newEmployees[index]!.id,
    amount: row.salaryAmount.toString(),
    currency: row.salaryCurrency,
    effectiveDate: row.hireDate,
    reason: 'CSV import',
    isCurrent: true,
  }));

  // Salary revisions only where the imported amount/currency actually differs
  const revisions = updates.filter((row) =>
    isSalaryChanged(row, existingByEmail.get(row.email.toLowerCase())!)
  );
  const revisionEmployeeIds = revisions.map(
    (row) => existingByEmail.get(row.email.toLowerCase())!.id
  );

  if (creates.length === 0 && updates.length === 0) {
    return { imported: 0, updated: 0, unchanged };
  }

  const statements = [
    prisma.employee.createMany({ data: newEmployees }),
    prisma.salaryRecord.createMany({ data: newSalaryRecords }),
    ...updates.map((row) =>
      prisma.employee.update({
        where: { id: existingByEmail.get(row.email.toLowerCase())!.id },
        data: {
          employeeCode: row.employeeCode,
          firstName: row.firstName,
          lastName: row.lastName,
          departmentId: departmentIds.get(row.department)!,
          countryId: countryIds.get(row.countryCode)!,
          jobLevel: row.jobLevel,
          status: row.status,
          hireDate: row.hireDate,
        },
      })
    ),
    prisma.salaryRecord.updateMany({
      where: { employeeId: { in: revisionEmployeeIds }, isCurrent: true },
      data: { isCurrent: false },
    }),
    prisma.salaryRecord.createMany({
      data: revisions.map((row) => ({
        employeeId: existingByEmail.get(row.email.toLowerCase())!.id,
        amount: row.salaryAmount.toString(),
        currency: row.salaryCurrency,
        effectiveDate: new Date(),
        reason: 'CSV import',
        isCurrent: true,
      })),
    }),
  ];

  for (let offset = 0; offset < statements.length; offset += WRITE_CHUNK_SIZE) {
    await prisma.$transaction(statements.slice(offset, offset + WRITE_CHUNK_SIZE), {
      timeout: TRANSACTION_TIMEOUT_MS,
    });
  }

  return { imported: creates.length, updated: updates.length, unchanged };
};

/** Same columns as the input plus `reason`, so the HR manager can fix and re-upload the same file. */
const buildRejectedCsv = (rejected: RejectedRow[], lang: SupportedLocale): string | null => {
  if (rejected.length === 0) {
    return null;
  }
  return stringify(
    rejected.map((row) => ({
      ...Object.fromEntries(CSV_IMPORT_HEADERS.map((h) => [h, row.raw[h] ?? ''])),
      reason: row.reasonKeys.map((key) => translate(key, lang)).join('; '),
    })),
    { header: true, columns: [...CSV_IMPORT_HEADERS, 'reason'] }
  );
};

export const importEmployeesCsv = async (
  fileBuffer: Buffer,
  lang: SupportedLocale
): Promise<ImportResult> => {
  const { validRows, rejected } = await parseAndValidate(fileBuffer);
  const deduped = dedupeKeepLast(validRows, rejected);
  const { imported, updated, unchanged } = await commitRows(deduped);

  logger.info('CSV import completed', {
    imported,
    updated,
    unchanged,
    rejected: rejected.length,
  });

  return {
    imported,
    updated,
    unchanged,
    rejected: rejected.length,
    rejectedCsv: buildRejectedCsv(rejected, lang),
  };
};
