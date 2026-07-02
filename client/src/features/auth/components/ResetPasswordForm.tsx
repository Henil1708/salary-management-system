import { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ResetPasswordInput, resetPasswordSchema } from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/form/text-field';
import { ApiCodeError, ApiFieldError } from '@/shared/services/api-client';
import { codeToMessage } from '@/shared/utils/errors';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { resetPassword } from '../actions/auth.actions';

export const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [succeeded, setSucceeded] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const token = searchParams.get('token') ?? '';

  if (!token) {
    return <p className="text-sm text-destructive">{t('auth.resetPassword.invalidToken')}</p>;
  }

  if (succeeded) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('auth.resetPassword.success')}</p>
        <Link to="/login" className="block text-center text-sm hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (
    values: ResetPasswordInput,
    helpers: FormikHelpers<ResetPasswordInput>
  ) => {
    setErrorCode(null);
    try {
      await dispatch(resetPassword(values));
      setSucceeded(true);
    } catch (error) {
      if (error instanceof ApiFieldError) {
        // server fail envelope: field→locale-key map, straight into Formik
        helpers.setErrors(error.fields);
      } else if (error instanceof ApiCodeError && error.code === 'RESET_TOKEN_INVALID') {
        setErrorCode('RESET_TOKEN_INVALID');
      } else {
        setErrorCode(error instanceof ApiCodeError ? error.code : 'INTERNAL');
      }
    }
  };

  return (
    <Formik<ResetPasswordInput>
      initialValues={{ token, newPassword: '' }}
      validate={zodToFormikValidate(resetPasswordSchema)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form className="space-y-4">
          <TextField
            name="newPassword"
            label={t('auth.resetPassword.newPasswordLabel')}
            type="password"
            autoComplete="new-password"
          />
          {errorCode && <p className="text-sm text-destructive">{codeToMessage(t, errorCode)}</p>}
          <Button type="submit" className="w-full" disabled={!dirty || !isValid || isSubmitting}>
            {t('auth.resetPassword.submit')}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
