import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ApiCodeError } from '@/shared/services/api-client';
import { codeToMessage } from '@/shared/utils/errors';
import { createRun } from '@/features/payroll';

interface GenerateRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const currentMonth = (): string => new Date().toISOString().slice(0, 7);

export const GenerateRunDialog = ({ open, onOpenChange }: GenerateRunDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [period, setPeriod] = useState(currentMonth());
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrorCode(null);
    setSubmitting(true);
    try {
      await dispatch(createRun(period));
      toast.success(t('payroll.generate.submit'));
      onOpenChange(false);
    } catch (error) {
      setErrorCode(error instanceof ApiCodeError ? error.code : 'INTERNAL');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('payroll.generate.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="period">{t('payroll.generate.period')}</Label>
          <Input
            id="period"
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t('payroll.generate.hint')}</p>
          {errorCode && <p className="text-sm text-destructive">{codeToMessage(t, errorCode)}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('payroll.generate.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !period}>
            {t('payroll.generate.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
