import { CreateDepartmentInput, DepartmentDto, UpdateDepartmentInput } from '@salary/shared';
import prisma from '@config/database';
import { ConflictError, NotFoundError } from '@utils/errors';

interface DepartmentRow {
  id: string;
  name: string;
  _count: { employees: number };
}

const toDto = (row: DepartmentRow): DepartmentDto => ({
  id: row.id,
  name: row.name,
  employeeCount: row._count.employees,
});

export const listDepartments = async (): Promise<DepartmentDto[]> => {
  const rows = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { employees: true } } },
  });
  return rows.map(toDto);
};

// Duplicate name surfaces as Prisma P2002 → the fail envelope maps it to `name`.
export const createDepartment = async (input: CreateDepartmentInput): Promise<DepartmentDto> => {
  const row = await prisma.department.create({
    data: { name: input.name },
    include: { _count: { select: { employees: true } } },
  });
  return toDto(row);
};

export const updateDepartment = async (
  id: string,
  input: UpdateDepartmentInput
): Promise<DepartmentDto> => {
  const row = await prisma.department.update({
    where: { id },
    data: { name: input.name },
    include: { _count: { select: { employees: true } } },
  });
  return toDto(row);
};

// A department with employees can't be deleted — reassign them first
// (the FK is Restrict by default; we check explicitly for a clear message).
export const deleteDepartment = async (id: string): Promise<void> => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } },
  });
  if (!department) {
    throw new NotFoundError('Department not found');
  }
  if (department._count.employees > 0) {
    throw new ConflictError('Department still has employees', 'DEPARTMENT_HAS_EMPLOYEES');
  }
  await prisma.department.delete({ where: { id } });
};
