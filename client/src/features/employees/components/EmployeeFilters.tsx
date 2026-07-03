import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { COUNTRIES, DEPARTMENTS, EMPLOYEE_STATUSES, JOB_LEVELS } from '@salary/shared';
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
import { getEmployeeQuery, updateQuery } from '@/features/employees';

const ALL = '__all__';

export const EmployeeFilters = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useAppSelector(getEmployeeQuery);

  const [search, setSearch] = useState(query.search ?? '');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    // only dispatch when the debounced term differs from what's in the query
    if ((debouncedSearch || undefined) !== query.search) {
      dispatch(updateQuery({ search: debouncedSearch || undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const filterSelect = (
    key: 'department' | 'countryCode' | 'jobLevel' | 'status',
    placeholder: string,
    options: { value: string; label: string }[]
  ) => (
    <Select
      value={(query[key] as string | undefined) ?? ALL}
      onValueChange={(value) => dispatch(updateQuery({ [key]: value === ALL ? undefined : value }))}
    >
      <SelectTrigger className="h-10 w-full sm:w-40">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t('employee.directory.allFilter')}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('employee.directory.searchPlaceholder')}
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {filterSelect(
          'department',
          t('employee.directory.filters.department'),
          DEPARTMENTS.map((d) => ({ value: d, label: d }))
        )}
        {filterSelect(
          'countryCode',
          t('employee.directory.filters.country'),
          COUNTRIES.map((c) => ({ value: c.code, label: c.name }))
        )}
        {filterSelect(
          'jobLevel',
          t('employee.directory.filters.jobLevel'),
          JOB_LEVELS.map((l) => ({ value: l, label: l }))
        )}
        {filterSelect(
          'status',
          t('employee.directory.filters.status'),
          EMPLOYEE_STATUSES.map((s) => ({ value: s, label: s }))
        )}
      </div>
    </div>
  );
};
