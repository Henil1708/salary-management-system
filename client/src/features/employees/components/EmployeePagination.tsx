import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { formatNumber } from '@/shared/utils/format';
import {
  getEmployeeQuery,
  getEmployeeTotal,
  getEmployeeTotalPages,
  updateQuery,
} from '@/features/employees';

export const EmployeePagination = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useAppSelector(getEmployeeQuery);
  const total = useAppSelector(getEmployeeTotal);
  const totalPages = useAppSelector(getEmployeeTotalPages);

  if (total === 0) {
    return null;
  }

  const from = (query.page - 1) * query.pageSize + 1;
  const to = Math.min(query.page * query.pageSize, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t('employee.directory.pagination.range', {
          from: formatNumber(from),
          to: formatNumber(to),
          total: formatNumber(total),
        })}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={query.page <= 1}
          onClick={() => dispatch(updateQuery({ page: query.page - 1 }))}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t('employee.directory.pagination.previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={query.page >= totalPages}
          onClick={() => dispatch(updateQuery({ page: query.page + 1 }))}
        >
          {t('employee.directory.pagination.next')}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
