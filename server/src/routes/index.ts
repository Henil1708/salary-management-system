import { Router } from 'express';
import authRoutes from '@routes/auth.routes';
import dashboardRoutes from '@routes/dashboard.routes';
import departmentRoutes from '@routes/department.routes';
import employeeRoutes from '@routes/employee.routes';
import exportRoutes from '@routes/export.routes';
import importRoutes from '@routes/import.routes';
import payrollRoutes from '@routes/payroll.routes';
import userRoutes from '@routes/user.routes';

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
router.use('/departments', departmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/import', importRoutes);
router.use('/export', exportRoutes);
router.use('/payroll', payrollRoutes);
router.use('/users', userRoutes);

export default router;
