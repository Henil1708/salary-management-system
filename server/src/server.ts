// env must load and validate before anything else reads process.env
import { env } from '@config/env';
import http from 'http';
import createApp from './app';
import logger from '@utils/logger';

const startServer = (): void => {
  const app = createApp();
  const httpServer = http.createServer(app);

  const server = httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`API endpoint: http://localhost:${env.PORT}/api/v1`);
  });

  const gracefulShutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
