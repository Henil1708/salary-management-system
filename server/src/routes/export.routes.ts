import { Router } from 'express';
import { employeeListQuerySchema } from '@salary/shared';
import { exportCsv } from '@controllers/export.controller';
import { requireAuth } from '@middleware/auth';
import { validateRequest } from '@middleware/validate';

const router = Router();

router.use(requireAuth);

// Accepts the same filter params as the directory list — the export is
// "the current filtered view", not a separate query language
router.get('/employees', validateRequest({ query: employeeListQuerySchema }), exportCsv);

export default router;
