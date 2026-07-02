import { Router } from 'express';
import { createSalaryRecordSchema } from '@salary/shared';
import { create, history } from '@controllers/salary-record.controller';
import { validateRequest } from '@middleware/validate';

// Mounted at /employees/:id/salary-records — mergeParams exposes the parent
// router's :id (already uuid-validated and auth-gated there).
const router = Router({ mergeParams: true });

router.get('/', history);
router.post('/', validateRequest({ body: createSalaryRecordSchema }), create);

export default router;
