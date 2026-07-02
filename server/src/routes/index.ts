import { Router } from 'express';
import authRoutes from '@routes/auth.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);

// Remaining feature routers (employees, dashboard, import/export) are
// mounted here as each feature lands.

export default router;
