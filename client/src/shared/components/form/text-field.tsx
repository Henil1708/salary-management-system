import { ReactNode } from 'react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { tError } from '@/shared/utils/errors';
import { cn } from '@/shared/utils/cn';

interface TextFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'date';
  placeholder?: string;
  autoComplete?: string;
  /** Rendered at the right end of the label row (e.g. a "forgot password?" link) */
  labelEnd?: ReactNode;
}

// Formik-connected shadcn input. Formik errors are locale KEYS (from the
// shared Zod schema locally, or the server's fail envelope) — translated
// here, at the last moment before display.
export const TextField = ({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  labelEnd,
}: TextFieldProps) => {
  const { t } = useTranslation();
  const [field, meta] = useField(name);
  const showError = meta.touched && Boolean(meta.error);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center">
        <Label htmlFor={name}>{label}</Label>
        {labelEnd && <span className="ml-auto">{labelEnd}</span>}
      </div>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(showError && 'border-destructive')}
        {...field}
      />
      {showError && <p className="text-xs text-destructive">{tError(t, meta.error!)}</p>}
    </div>
  );
};
