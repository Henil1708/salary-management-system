import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { UpdateProfileInput, updateProfileSchema } from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { useAuth, updateProfile } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TextField } from '@/shared/components/form/text-field';
import { ApiFieldError } from '@/shared/services/api-client';
import { zodToFormikValidate } from '@/shared/utils/formik';

export const ProfileForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const handleSubmit = async (
    values: UpdateProfileInput,
    helpers: FormikHelpers<UpdateProfileInput>
  ) => {
    try {
      await dispatch(updateProfile(values));
      toast.success(t('common.toast.profileUpdated'));
      helpers.resetForm({ values });
    } catch (error) {
      if (error instanceof ApiFieldError) {
        helpers.setErrors(error.fields as Record<string, string>);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('settings.profile.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">{t('settings.profile.subtitle')}</p>
      </CardHeader>
      <CardContent>
        <Formik<UpdateProfileInput>
          initialValues={{
            username: user.username,
            email: user.email,
            designation: user.designation,
          }}
          validate={zodToFormikValidate(updateProfileSchema)}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField name="username" label={t('settings.profile.username')} />
                <TextField name="email" label={t('settings.profile.email')} type="email" />
                <TextField name="designation" label={t('settings.profile.designation')} />
              </div>
              <Button type="submit" disabled={isSubmitting || !dirty || !isValid}>
                {t('settings.profile.save')}
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};
