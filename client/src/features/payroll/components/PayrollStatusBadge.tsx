import { useTranslation } from 'react-i18next';
import { PayrollStatus } from '@salary/shared';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/utils/cn';

const STYLES: Record<PayrollStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  PROCESSING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
};

export const PayrollStatusBadge = ({ status }: { status: PayrollStatus }) => {
  const { t } = useTranslation();
  return (
    <Badge variant="secondary" className={cn('border-0', STYLES[status])}>
      {t(`payroll.status.${status}`)}
    </Badge>
  );
};
