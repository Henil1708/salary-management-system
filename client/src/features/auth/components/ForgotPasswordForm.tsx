import { useState } from 'react';
import { Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ForgotPasswordInput, forgotPasswordSchema } from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/form/text-field';
import { ApiCodeError } from '@/shared/services/api-client';
import { codeToMessage } from '@/shared/utils/errors';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { forgotPassword } from '../actions/auth.actions';

export const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [submitted, setSubmitted] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  if (submitted) {
    // Always the same generic confirmation — the API never reveals whether
    // the account exists (docs/TRADEOFFS.md §4)
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('auth.forgotPassword.genericConfirmation')}
        </p>
        <Link to="/login" className="block text-center text-sm hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (values: ForgotPasswordInput) => {
    setErrorCode(null);
    try {
      await dispatch(forgotPassword(values));
      setSubmitted(true);
    } catch (error) {
      setErrorCode(error instanceof ApiCodeError ? error.code : 'INTERNAL');
    }
  };

  return (
    <Formik<ForgotPasswordInput>
      initialValues={{ identifier: '' }}
      validate={zodToFormikValidate(forgotPasswordSchema)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form className="space-y-4">
          <TextField
            name="identifier"
            label={t('auth.login.identifierLabel')}
            autoComplete="username"
          />
          {errorCode && <p className="text-sm text-destructive">{codeToMessage(t, errorCode)}</p>}
          <Button type="submit" className="w-full" disabled={!dirty || !isValid || isSubmitting}>
            {t('auth.forgotPassword.submit')}
          </Button>
          <Link to="/login" className="block text-center text-sm text-muted-foreground hover:underline">
            {t('auth.backToLogin')}
          </Link>
        </Form>
      )}
    </Formik>
  );
};
