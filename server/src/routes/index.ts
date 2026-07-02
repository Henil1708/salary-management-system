import { Router } from 'express';

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

// Feature routers (auth, employees, dashboard, import/export) are mounted
// here as each feature lands.

export default router;
