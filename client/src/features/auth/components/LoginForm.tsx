import { Form, Formik } from 'formik';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Mail } from 'lucide-react';
import { loginSchema } from '@salary/shared';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { TextField } from '@/shared/components/form/text-field';
import { codeToMessage } from '@/shared/utils/errors';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { login } from '../actions/auth.actions';
import { getAuthErrorCode, getAuthStatus } from '../selectors/auth.selectors';

interface LoginFormValues {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector(getAuthStatus);
  const errorCode = useAppSelector(getAuthErrorCode);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const handleSubmit = async ({ rememberMe, ...credentials }: LoginFormValues) => {
    const succeeded = await dispatch(login(credentials, rememberMe));
    if (succeeded) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Formik<LoginFormValues>
      initialValues={{ identifier: '', password: '', rememberMe: true }}
      // extra client-only fields (rememberMe) are ignored by the schema
      validate={zodToFormikValidate(loginSchema)}
      onSubmit={handleSubmit}
    >
      {({ isValid, dirty, values, setFieldValue }) => (
        <Form className="space-y-5">
          <TextField
            name="identifier"
            label={t('auth.login.identifierLabel')}
            placeholder={t('auth.login.identifierPlaceholder')}
            autoComplete="username"
            icon={<Mail />}
          />
          <TextField
            name="password"
            label={t('auth.login.passwordLabel')}
            type="password"
            placeholder={t('auth.login.passwordPlaceholder')}
            autoComplete="current-password"
            icon={<Lock />}
          />
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={values.rememberMe}
                onCheckedChange={(checked) => setFieldValue('rememberMe', checked === true)}
              />
              <Label htmlFor="rememberMe" className="font-normal">
                {t('auth.login.rememberMe')}
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm text-primary underline-offset-2 hover:underline"
            >
              {t('auth.login.forgotPasswordLink')}
            </Link>
          </div>
          {errorCode && <p className="text-sm text-destructive">{codeToMessage(t, errorCode)}</p>}
          {/* disabled until the user has typed something AND it passes the schema */}
          <Button
            type="submit"
            className="w-full"
            disabled={!dirty || !isValid || status === 'loading'}
          >
            {t('auth.login.submit')}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
