import {
  CreateEmployeeInput,
  EmployeeDto,
  EmployeeListQuery,
  Paginated,
  UpdateEmployeeInput,
} from '@salary/shared';
import prisma from '@config/database';
import { Prisma } from '../generated/prisma/client';
import { BadRequestError, NotFoundError } from '@utils/errors';

const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  email: true,
  jobLevel: true,
  status: true,
  hireDate: true,
  department: { select: { name: true } },
  country: { select: { code: true, name: true } },
  salaryRecords: {
    where: { isCurrent: true },
    take: 1,
    select: { amount: true, currency: true, effectiveDate: true },
  },
} satisfies Prisma.EmployeeSelect;

type EmployeeRow = Prisma.EmployeeGetPayload<{ select: typeof employeeSelect }>;

const toDto = (row: EmployeeRow): EmployeeDto => ({
  id: row.id,
  employeeCode: row.employeeCode,
  firstName: row.firstName,
  lastName: row.lastName,
  email: row.email,
  department: row.department.name,
  countryCode: row.country.code,
  countryName: row.country.name,
  jobLevel: row.jobLevel,
  status: row.status,
  hireDate: row.hireDate,
  currentSalary: row.salaryRecords[0]
    ? {
        amount: Number(row.salaryRecords[0].amount),
        currency: row.salaryRecords[0].currency,
        effectiveDate: row.salaryRecords[0].effectiveDate,
      }
    : null,
});

// Exported so the CSV export endpoint reuses the exact same filter semantics
// instead of duplicating them (see GitHub issue #2).
export const buildEmployeeWhere = (query: EmployeeListQuery): Prisma.EmployeeWhereInput => {
  const where: Prisma.EmployeeWhereInput = {};

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { employeeCode: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.department) {
    where.department = { name: query.department };
  }
  if (query.countryCode) {
    where.country = { code: query.countryCode };
  }
  if (query.jobLevel) {
    where.jobLevel = query.jobLevel;
  }
  if (query.status) {
    where.status = query.status;
  }

  return where;
};

export const listEmployees = async (
  query: EmployeeListQuery
): Promise<Paginated<EmployeeDto>> => {
  const where = buildEmployeeWhere(query);

  const [rows, total] = await prisma.$transaction([
    prisma.employee.findMany({
      where,
      select: employeeSelect,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    items: rows.map(toDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  };
};

export const getEmployee = async (id: string): Promise<EmployeeDto> => {
  const row = await prisma.employee.findUnique({ where: { id }, select: employeeSelect });
  if (!row) {
    throw new NotFoundError('Employee not found');
  }
  return toDto(row);
};

// department (name) and countryCode arrive already validated against the
// shared enums; the DB rows exist via the reference seed — a miss here means
// the seed hasn't run, which deserves a loud error.
const resolveReferences = async (
  department?: string,
  countryCode?: string
): Promise<{ departmentId?: string; countryId?: string }> => {
  const result: { departmentId?: string; countryId?: string } = {};

  if (department) {
    const row = await prisma.department.findUnique({ where: { name: department } });
    if (!row) {
      throw new BadRequestError(`Department "${department}" is not seeded`);
    }
    result.departmentId = row.id;
  }
  if (countryCode) {
    const row = await prisma.country.findUnique({ where: { code: countryCode } });
    if (!row) {
      throw new BadRequestError(`Country "${countryCode}" is not seeded`);
    }
    result.countryId = row.id;
  }

  return result;
};

export const createEmployee = async (input: CreateEmployeeInput): Promise<EmployeeDto> => {
  const { departmentId, countryId } = await resolveReferences(input.department, input.countryCode);

  const row = await prisma.employee.create({
    data: {
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      departmentId: departmentId!,
      countryId: countryId!,
      jobLevel: input.jobLevel,
      status: input.status,
      hireDate: input.hireDate,
    },
    select: employeeSelect,
  });

  return toDto(row);
};

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput
): Promise<EmployeeDto> => {
  const { departmentId, countryId } = await resolveReferences(input.department, input.countryCode);

  const row = await prisma.employee.update({
    where: { id },
    data: {
      ...(input.employeeCode !== undefined && { employeeCode: input.employeeCode }),
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.email !== undefined && { email: input.email }),
      ...(departmentId !== undefined && { departmentId }),
      ...(countryId !== undefined && { countryId }),
      ...(input.jobLevel !== undefined && { jobLevel: input.jobLevel }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.hireDate !== undefined && { hireDate: input.hireDate }),
    },
    select: employeeSelect,
  });

  return toDto(row);
};
