import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
  EmployeeDto,
  EmployeeSortableColumn,
  EMPLOYEE_SORTABLE_COLUMNS,
} from '@salary/shared';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { formatCurrency } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { getEmployeeQuery, getEmployees, updateQuery } from '@/features/employees';

const SORTABLE = new Set<string>(EMPLOYEE_SORTABLE_COLUMNS);

export const EmployeeTable = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const employees = useAppSelector(getEmployees);
  const query = useAppSelector(getEmployeeQuery);

  // clicking a sortable header toggles order, or switches column (asc first)
  const toggleSort = (column: string) => {
    if (!SORTABLE.has(column)) {
      return;
    }
    const sortBy = column as EmployeeSortableColumn;
    const sortOrder = query.sortBy === sortBy && query.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(updateQuery({ sortBy, sortOrder, page: query.page }));
  };

  const header = (labelKey: string, column?: EmployeeSortableColumn, align: 'left' | 'right' = 'left') => {
    const active = column && query.sortBy === column;
    return (
      <TableHead
        onClick={column ? () => toggleSort(column) : undefined}
        className={cn(
          align === 'right' && 'text-right',
          column && 'cursor-pointer select-none hover:text-foreground'
        )}
      >
        <span className={cn('inline-flex items-center gap-1', align === 'right' && 'flex-row-reverse')}>
          {t(labelKey)}
          {active &&
            (query.sortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            ))}
        </span>
      </TableHead>
    );
  };

  const cols = 'employee.directory.columns';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {header(`${cols}.employeeCode`, 'employeeCode')}
          {header(`${cols}.name`, 'lastName')}
          {header(`${cols}.email`, 'email')}
          {header(`${cols}.department`)}
          {header(`${cols}.country`)}
          {header(`${cols}.jobLevel`)}
          {header(`${cols}.status`)}
          {header(`${cols}.currentSalary`, undefined, 'right')}
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee: EmployeeDto) => (
          <TableRow
            key={employee.id}
            onClick={() => navigate(`/employees/${employee.id}`)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium tabular-nums">{employee.employeeCode}</TableCell>
            <TableCell>
              {employee.firstName} {employee.lastName}
            </TableCell>
            <TableCell className="text-muted-foreground">{employee.email}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.countryName}</TableCell>
            <TableCell>{employee.jobLevel}</TableCell>
            <TableCell>
              <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {employee.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {employee.currentSalary
                ? `${formatCurrency(employee.currentSalary.amount, employee.currentSalary.currency)}${t('common.perMonth')}`
                : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
