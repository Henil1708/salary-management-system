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

const router = Router();

// All employee routes require a valid access token
router.use(requireAuth);

router.get('/', validateRequest({ query: employeeListQuerySchema }), list);
router.post('/', validateRequest({ body: createEmployeeSchema }), create);
router.get('/:id', validateRequest({ params: employeeIdParamSchema }), get);
router.patch(
  '/:id',
  validateRequest({ params: employeeIdParamSchema, body: updateEmployeeSchema }),
  update
);

export default router;
