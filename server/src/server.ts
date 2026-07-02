// env must load and validate before anything else reads process.env
import { env } from '@config/env';
import http from 'http';
import createApp from './app';
import logger from '@utils/logger';
import { connectDatabase, disconnectDatabase } from '@config/database';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);

  const server = httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`API endpoint: http://localhost:${env.PORT}/api/v1`);
  });

  const gracefulShutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDatabase();
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

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
