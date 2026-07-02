import { Router } from 'express';
import multer from 'multer';
import { importQuerySchema } from '@salary/shared';
import { importCsv } from '@controllers/import.controller';
import { requireAuth } from '@middleware/auth';
import { validateRequest } from '@middleware/validate';

// In-memory upload — files are parsed and discarded, never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.use(requireAuth);

router.post(
  '/employees',
  upload.single('file'),
  validateRequest({ query: importQuerySchema }),
  importCsv
);

export default router;
