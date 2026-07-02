import { Router } from 'express';
import authRoutes from '@routes/auth.routes';
import dashboardRoutes from '@routes/dashboard.routes';
import employeeRoutes from '@routes/employee.routes';

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
router.use('/employees', employeeRoutes);
router.use('/dashboard', dashboardRoutes);

// Remaining feature routers (import/export) are mounted here as each
// feature lands.

export default router;
