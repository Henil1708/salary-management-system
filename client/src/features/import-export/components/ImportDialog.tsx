import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download, FileUp } from 'lucide-react';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ApiCodeError } from '@/shared/services/api-client';
import { codeToMessage } from '@/shared/utils/errors';
import { formatNumber } from '@/shared/utils/format';
import { ImportResult, runImport } from '@/features/import-export';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setErrorCode(null);
    setImporting(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const handleImport = async () => {
    if (!file) {
      return;
    }
    setImporting(true);
    setErrorCode(null);
    try {
      const summary = await dispatch(runImport(file));
      setResult(summary);
      toast.success(t('import.resultTitle'));
    } catch (error) {
      setErrorCode(error instanceof ApiCodeError ? error.code : 'INTERNAL');
    } finally {
      setImporting(false);
    }
  };

  const downloadRejected = () => {
    if (!result?.rejectedCsv) {
      return;
    }
    const blob = new Blob([result.rejectedCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rejected-rows.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const stat = (labelKey: string, value: number, tone = 'text-foreground') => (
    <div className="rounded-lg border p-3 text-center">
      <div className={`text-xl font-bold tabular-nums ${tone}`}>{formatNumber(value)}</div>
      <div className="text-xs text-muted-foreground">{t(labelKey)}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{result ? t('import.resultTitle') : t('import.title')}</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {stat('import.imported', result.imported, 'text-emerald-600')}
              {stat('import.updated', result.updated, 'text-sky-600')}
              {stat('import.unchanged', result.unchanged, 'text-muted-foreground')}
              {stat('import.rejected', result.rejected, result.rejected ? 'text-destructive' : '')}
            </div>
            {result.rejectedCsv && (
              <Button variant="outline" className="w-full" onClick={downloadRejected}>
                <Download className="mr-1 h-4 w-4" />
                {t('import.downloadErrors')}
              </Button>
            )}
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>{t('import.done')}</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('import.uploadPrompt')}</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
            >
              <FileUp className="h-6 w-6" />
              {file ? file.name : t('import.chooseFile')}
            </button>
            {errorCode && <p className="text-sm text-destructive">{codeToMessage(t, errorCode)}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t('employee.form.cancel')}
              </Button>
              <Button onClick={handleImport} disabled={!file || importing}>
                {importing ? t('import.importing') : t('import.submit')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
