import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { getEmployeeQuery } from '@/features/employees';
import { downloadExport } from '@/features/import-export';

// Exports the CURRENT filtered directory view (reuses the employee query).
export const ExportButton = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useAppSelector(getEmployeeQuery);
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      await dispatch(downloadExport(query));
    } catch {
      toast.error(t('common.errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={busy}>
      {busy ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-1 h-4 w-4" />
      )}
      {busy ? t('common.exporting') : t('common.export')}
    </Button>
  );
};
