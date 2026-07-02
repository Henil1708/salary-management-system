import { CreateSalaryRecordInput } from '@salary/shared';
import prisma from '@config/database';
import { NotFoundError } from '@utils/errors';

export interface SalaryRecordDto {
  id: string;
  amount: number;
  currency: string;
  effectiveDate: Date;
  reason: string;
  isCurrent: boolean;
  createdAt: Date;
}

interface SalaryRecordRow {
  id: string;
  amount: unknown; // Prisma Decimal
  currency: string;
  effectiveDate: Date;
  reason: string;
  isCurrent: boolean;
  createdAt: Date;
}

const toDto = (row: SalaryRecordRow): SalaryRecordDto => ({
  id: row.id,
  amount: Number(row.amount),
  currency: row.currency,
  effectiveDate: row.effectiveDate,
  reason: row.reason,
  isCurrent: row.isCurrent,
  createdAt: row.createdAt,
});

const assertEmployeeExists = async (employeeId: string): Promise<void> => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) {
    throw new NotFoundError('Employee not found');
  }
};

export const getHistory = async (employeeId: string): Promise<SalaryRecordDto[]> => {
  await assertEmployeeExists(employeeId);

  const rows = await prisma.salaryRecord.findMany({
    where: { employeeId },
    orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(toDto);
};

/**
 * The append-only ledger invariant lives here and nowhere else
 * (docs/TRADEOFFS.md §1): a salary change is a NEW row — never an overwrite —
 * and the previous current record is demoted in the same transaction, so
 * exactly one record per employee carries isCurrent at any point in time.
 */
export const addSalaryRecord = async (
  employeeId: string,
  input: CreateSalaryRecordInput
): Promise<SalaryRecordDto> => {
  await assertEmployeeExists(employeeId);

  const [, created] = await prisma.$transaction([
    prisma.salaryRecord.updateMany({
      where: { employeeId, isCurrent: true },
      data: { isCurrent: false },
    }),
    prisma.salaryRecord.create({
      data: {
        employeeId,
        // Decimal column — pass as string so no float representation is
        // involved anywhere (docs/TRADEOFFS.md §1)
        amount: input.amount.toString(),
        currency: input.currency,
        effectiveDate: input.effectiveDate,
        reason: input.reason,
        isCurrent: true,
      },
    }),
  ]);

  return toDto(created);
};
