import { ReactNode, useState } from 'react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
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
  /** Leading icon inside the input (e.g. <Mail />, <Lock />) */
  icon?: ReactNode;
  /** Rendered at the right end of the label row (e.g. a "forgot password?" link) */
  labelEnd?: ReactNode;
}

// Formik-connected shadcn input. Formik errors are locale KEYS (from the
// shared Zod schema locally, or the server's fail envelope) — translated
// here, at the last moment before display. Password fields get a
// visibility toggle.
export const TextField = ({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  icon,
  labelEnd,
}: TextFieldProps) => {
  const { t } = useTranslation();
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const showError = meta.touched && Boolean(meta.error);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center">
        <Label htmlFor={name}>{label}</Label>
        {labelEnd && <span className="ml-auto">{labelEnd}</span>}
      </div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
        <Input
          id={name}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            icon && 'pl-9',
            isPassword && 'pr-9',
            showError && 'border-destructive'
          )}
          {...field}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {showError && <p className="text-xs text-destructive">{tError(t, meta.error!)}</p>}
    </div>
  );
};
