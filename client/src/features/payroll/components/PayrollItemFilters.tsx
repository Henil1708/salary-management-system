import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { fetchDepartments, getDepartmentNames } from '@/features/departments';
import { getItemFilters, setItemFilters } from '@/features/payroll';

const ALL = '__all__';

// Filters a payroll run's line items by name/ID, department and USD range.
// "Mark all paid" on the run page acts on exactly this filtered set.
export const PayrollItemFilters = ({ runId }: { runId: string }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(getItemFilters);
  const departmentNames = useAppSelector(getDepartmentNames);

  const [search, setSearch] = useState(filters.search ?? '');
  const [minUsd, setMinUsd] = useState(filters.minUsd?.toString() ?? '');
  const [maxUsd, setMaxUsd] = useState(filters.maxUsd?.toString() ?? '');
  const debouncedSearch = useDebounce(search);
  const debouncedMin = useDebounce(minUsd);
  const debouncedMax = useDebounce(maxUsd);

  useEffect(() => {
    if (departmentNames.length === 0) {
      void dispatch(fetchDepartments());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(
      setItemFilters(runId, {
        search: debouncedSearch || undefined,
        department: filters.department,
        minUsd: debouncedMin ? Number(debouncedMin) : undefined,
        maxUsd: debouncedMax ? Number(debouncedMax) : undefined,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedMin, debouncedMax]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('payroll.run.filters.search')}
          className="pl-9"
        />
      </div>
      <Select
        value={filters.department ?? ALL}
        onValueChange={(value) =>
          dispatch(setItemFilters(runId, { ...filters, department: value === ALL ? undefined : value }))
        }
      >
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder={t('payroll.run.filters.department')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('payroll.run.filters.all')}</SelectItem>
          {departmentNames.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        value={minUsd}
        onChange={(e) => setMinUsd(e.target.value)}
        placeholder={t('payroll.run.filters.minUsd')}
        className="w-full lg:w-32"
      />
      <Input
        type="number"
        value={maxUsd}
        onChange={(e) => setMaxUsd(e.target.value)}
        placeholder={t('payroll.run.filters.maxUsd')}
        className="w-full lg:w-32"
      />
    </div>
  );
};
