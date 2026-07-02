import { Form, Formik } from 'formik';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginInput, loginSchema } from '@salary/shared';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/form/text-field';
import { codeToMessage } from '@/shared/utils/errors';
import { zodToFormikValidate } from '@/shared/utils/formik';
import { login } from '../actions/auth.actions';
import { getAuthErrorCode, getAuthStatus } from '../selectors/auth.selectors';

export const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector(getAuthStatus);
  const errorCode = useAppSelector(getAuthErrorCode);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const handleSubmit = async (values: LoginInput) => {
    const succeeded = await dispatch(login(values));
    if (succeeded) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Formik<LoginInput>
      initialValues={{ identifier: '', password: '' }}
      validate={zodToFormikValidate(loginSchema)}
      onSubmit={handleSubmit}
    >
      {({ isValid, dirty }) => (
        <Form className="space-y-4">
          <TextField
            name="identifier"
            label={t('auth.login.identifierLabel')}
            autoComplete="username"
          />
          <TextField
            name="password"
            label={t('auth.login.passwordLabel')}
            type="password"
            autoComplete="current-password"
            labelEnd={
              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-2 hover:underline"
              >
                {t('auth.login.forgotPasswordLink')}
              </Link>
            }
          />
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
