import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CreateUserInput, createUserSchema } from '@salary/shared';
import { useAppDispatch } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { TextField } from '@/shared/components/form/text-field';
import { ApiFieldError } from '@/shared/services/api-client';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { createHrUser } from '@/features/users';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialValues: CreateUserInput = {
  username: '',
  email: '',
  designation: '',
  password: '',
};

export const AddUserDialog = ({ open, onOpenChange }: AddUserDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleSubmit = async (values: CreateUserInput, helpers: FormikHelpers<CreateUserInput>) => {
    try {
      await dispatch(createHrUser(values));
      toast.success(t('common.toast.userCreated'));
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiFieldError) {
        helpers.setErrors(error.fields as Record<string, string>);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.addUser')}</DialogTitle>
        </DialogHeader>
        <Formik<CreateUserInput>
          initialValues={initialValues}
          validate={zodToFormikValidate(createUserSchema)}
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="space-y-4">
              <TextField name="username" label={t('users.form.username')} autoComplete="off" />
              <TextField name="email" label={t('users.form.email')} type="email" autoComplete="off" />
              <TextField name="designation" label={t('users.form.designation')} />
              <TextField
                name="password"
                label={t('users.form.password')}
                type="password"
                autoComplete="new-password"
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('users.form.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || !dirty || !isValid}>
                  {t('users.form.save')}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
