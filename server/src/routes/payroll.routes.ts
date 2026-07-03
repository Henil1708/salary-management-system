import { Router } from 'express';
import {
  createPayrollRunSchema,
  markPayrollItemSchema,
  payrollItemsQuerySchema,
} from '@salary/shared';
import {
  createRun,
  getRun,
  listRuns,
  markAllPaid,
  markItem,
} from '@controllers/payroll.controller';
import { requireAuth } from '@middleware/auth';
import { validateRequest } from '@middleware/validate';

const router = Router();

router.use(requireAuth);

router.get('/runs', listRuns);
router.post('/runs', validateRequest({ body: createPayrollRunSchema }), createRun);
router.get('/runs/:id', validateRequest({ query: payrollItemsQuerySchema }), getRun);
router.post('/runs/:id/pay-all', validateRequest({ query: payrollItemsQuerySchema }), markAllPaid);
router.patch('/runs/:id/items/:itemId', validateRequest({ body: markPayrollItemSchema }), markItem);

export default router;
