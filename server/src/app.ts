import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport, { configurePassport } from '@config/passport';
import { env } from '@config/env';
import { errorHandler, notFoundHandler } from '@middleware/errorHandler';
import routes from '@routes/index';

const createApp = (): Application => {
  const app = express();

  app.use(helmet());

  // Bearer-token auth over the Authorization header — no cookies, so no
  // `credentials: true` needed (see docs/TRADEOFFS.md §4).
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());

  configurePassport();
  app.use(passport.initialize());

  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
