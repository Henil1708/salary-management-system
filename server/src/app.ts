import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@config/env';
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

  app.use('/api/v1', routes);

  return app;
};

export default createApp;
