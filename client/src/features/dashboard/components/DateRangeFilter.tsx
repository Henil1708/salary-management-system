import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { setDashboardRange } from '@/features/dashboard';

type Preset = 'all' | 'last7' | 'last30' | 'last90' | 'custom';

const iso = (d: Date): string => d.toISOString().slice(0, 10);
const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

// Drives the whole dashboard's "as of" window. Presets set start/end and
// apply immediately; Custom reveals two date inputs + Apply.
export const DateRangeFilter = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [preset, setPreset] = useState<Preset>('all');
  const [start, setStart] = useState(daysAgo(30));
  const [end, setEnd] = useState(iso(new Date()));

  const applyPreset = (value: Preset) => {
    setPreset(value);
    switch (value) {
      case 'all':
        return dispatch(setDashboardRange({}));
      case 'last7':
        return dispatch(setDashboardRange({ start: daysAgo(7), end: iso(new Date()) }));
      case 'last30':
        return dispatch(setDashboardRange({ start: daysAgo(30), end: iso(new Date()) }));
      case 'last90':
        return dispatch(setDashboardRange({ start: daysAgo(90), end: iso(new Date()) }));
      case 'custom':
        return undefined; // wait for Apply
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={(v) => applyPreset(v as Preset)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('dashboard.range.allTime')}</SelectItem>
          <SelectItem value="last7">{t('dashboard.range.last7')}</SelectItem>
          <SelectItem value="last30">{t('dashboard.range.last30')}</SelectItem>
          <SelectItem value="last90">{t('dashboard.range.last90')}</SelectItem>
          <SelectItem value="custom">{t('dashboard.range.custom')}</SelectItem>
        </SelectContent>
      </Select>

      {preset === 'custom' && (
        <>
          <Input
            type="date"
            value={start}
            max={end}
            onChange={(e) => setStart(e.target.value)}
            className="w-40"
            aria-label={t('dashboard.range.from')}
          />
          <Input
            type="date"
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
            className="w-40"
            aria-label={t('dashboard.range.to')}
          />
          <Button variant="outline" onClick={() => dispatch(setDashboardRange({ start, end }))}>
            {t('dashboard.range.apply')}
          </Button>
        </>
      )}
    </div>
  );
};
