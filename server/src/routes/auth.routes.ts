import { Router } from 'express';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from '@salary/shared';
import { forgotPassword, login, me, refresh, resetPassword } from '@controllers/auth.controller';
import { requireAuth, requireLocalCredentials, requireRefreshToken } from '@middleware/auth';
import { forgotPasswordRateLimiter, loginRateLimiter } from '@middleware/rateLimiter';
import { validateRequest } from '@middleware/validate';

const router = Router();

router.post(
  '/login',
  loginRateLimiter,
  validateRequest({ body: loginSchema }),
  requireLocalCredentials,
  login
);
router.post('/refresh', requireRefreshToken, refresh);
router.post(
  '/forgot-password',
  forgotPasswordRateLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword
);
router.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword);
router.get('/me', requireAuth, me);

export default router;
