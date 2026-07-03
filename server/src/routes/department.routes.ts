import { Router } from 'express';
import { createDepartmentSchema, updateDepartmentSchema } from '@salary/shared';
import { create, list, remove, update } from '@controllers/department.controller';
import { requireAuth } from '@middleware/auth';
import { validateRequest } from '@middleware/validate';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', validateRequest({ body: createDepartmentSchema }), create);
router.patch('/:id', validateRequest({ body: updateDepartmentSchema }), update);
router.delete('/:id', remove);

export default router;
