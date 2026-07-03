import { Router } from 'express';
import { dashboardDimensionQuerySchema, recentChangesQuerySchema } from '@salary/shared';
import {
  byDimension,
  payBands,
  payrollTrend,
  recentChanges,
  summary,
} from '@controllers/dashboard.controller';
import { requireAuth } from '@middleware/auth';
import { validateRequest } from '@middleware/validate';

const router = Router();

router.use(requireAuth);

router.get('/summary', summary);
router.get(
  '/salary-by-dimension',
  validateRequest({ query: dashboardDimensionQuerySchema }),
  byDimension
);
router.get('/pay-bands', payBands);
router.get('/payroll-trend', payrollTrend);
router.get(
  '/recent-changes',
  validateRequest({ query: recentChangesQuerySchema }),
  recentChanges
);

export default router;
