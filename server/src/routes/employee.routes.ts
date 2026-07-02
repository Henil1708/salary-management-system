import { Router } from 'express';
import {
  createEmployeeSchema,
  employeeIdParamSchema,
  employeeListQuerySchema,
  updateEmployeeSchema,
} from '@salary/shared';
import { create, get, list, update } from '@controllers/employee.controller';
import { requireAuth } from '@middleware/auth';
import { validateRequest } from '@middleware/validate';
import salaryRecordRoutes from '@routes/salary-record.routes';

const router = Router();

// All employee routes require a valid access token
router.use(requireAuth);

// Salary history / revisions nest under an employee (docs/TRADEOFFS.md §1)
router.use(
  '/:id/salary-records',
  validateRequest({ params: employeeIdParamSchema }),
  salaryRecordRoutes
);

router.get('/', validateRequest({ query: employeeListQuerySchema }), list);
router.post('/', validateRequest({ body: createEmployeeSchema }), create);
router.get('/:id', validateRequest({ params: employeeIdParamSchema }), get);
router.patch(
  '/:id',
  validateRequest({ params: employeeIdParamSchema, body: updateEmployeeSchema }),
  update
);

export default router;
