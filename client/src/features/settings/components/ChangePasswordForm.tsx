import { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ChangePasswordInput, changePasswordSchema } from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { changePassword } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TextField } from '@/shared/components/form/text-field';
import { ApiCodeError, ApiFieldError } from '@/shared/services/api-client';
import { codeToMessage } from '@/shared/utils/errors';
import { zodToFormikValidate } from '@/shared/utils/formik';

export const ChangePasswordForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleSubmit = async (
    values: ChangePasswordInput,
    helpers: FormikHelpers<ChangePasswordInput>
  ) => {
    setErrorCode(null);
    try {
      await dispatch(changePassword(values));
      toast.success(t('common.toast.passwordChanged'));
      helpers.resetForm();
    } catch (error) {
      if (error instanceof ApiFieldError) {
        helpers.setErrors(error.fields as Record<string, string>);
      } else {
        setErrorCode(error instanceof ApiCodeError ? error.code : 'INTERNAL');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('settings.password.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('settings.password.subtitle')}</p>
      </CardHeader>
      <CardContent>
        <Formik<ChangePasswordInput>
          initialValues={{ currentPassword: '', newPassword: '' }}
          validate={zodToFormikValidate(changePasswordSchema)}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  name="currentPassword"
                  label={t('settings.password.current')}
                  type="password"
                  autoComplete="current-password"
                />
                <TextField
                  name="newPassword"
                  label={t('settings.password.new')}
                  type="password"
                  autoComplete="new-password"
                />
              </div>
              {errorCode && <p className="text-sm text-destructive">{codeToMessage(t, errorCode)}</p>}
              <Button type="submit" disabled={isSubmitting || !dirty || !isValid}>
                {t('settings.password.save')}
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};
