import { Router } from 'express';
import authRoutes from '@routes/auth.routes';
import dashboardRoutes from '@routes/dashboard.routes';
import employeeRoutes from '@routes/employee.routes';
import exportRoutes from '@routes/export.routes';
import importRoutes from '@routes/import.routes';

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
router.use('/import', importRoutes);
router.use('/export', exportRoutes);

export default router;
