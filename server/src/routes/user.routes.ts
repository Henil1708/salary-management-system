import { Router } from 'express';
import { createUserSchema } from '@salary/shared';
import { create, list } from '@controllers/user.controller';
import { requireAuth } from '@middleware/auth';
import { validateRequest } from '@middleware/validate';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', validateRequest({ body: createUserSchema }), create);

export default router;
