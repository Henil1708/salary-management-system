import { Router } from 'express';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '@salary/shared';
import {
  changePassword,
  forgotPassword,
  login,
  me,
  refresh,
  resetPassword,
  updateMe,
} from '@controllers/auth.controller';
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
router.patch('/me', requireAuth, validateRequest({ body: updateProfileSchema }), updateMe);
router.post(
  '/change-password',
  requireAuth,
  validateRequest({ body: changePasswordSchema }),
  changePassword
);

export default router;
