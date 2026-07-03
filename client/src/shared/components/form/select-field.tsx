import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { tError } from '@/shared/utils/errors';

interface SelectFieldProps {
  name: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
}

// Formik-connected shadcn select. Error strings are locale KEYS, translated
// here (same contract as TextField).
export const SelectField = ({ name, label, options, placeholder }: SelectFieldProps) => {
  const { t } = useTranslation();
  const [field, meta, helpers] = useField(name);
  const showError = meta.touched && Boolean(meta.error);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select value={field.value ?? ''} onValueChange={(value) => helpers.setValue(value)}>
        <SelectTrigger id={name} className={showError ? 'border-destructive' : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && <p className="text-xs text-destructive">{tError(t, meta.error!)}</p>}
    </div>
  );
};
