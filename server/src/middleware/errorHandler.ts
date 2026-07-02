import { NextFunction, Request, Response } from 'express';
import { ApiError, ApiFail } from '@salary/shared';
import { Prisma } from '../generated/prisma/client';
import { AppError, FieldValidationError } from '@utils/errors';
import { env } from '@config/env';
import logger from '@utils/logger';

const sendError = (res: Response, statusCode: number, message: string, code: string): void => {
  const body: ApiError = { status: 'error', message, code };
  res.status(statusCode).json(body);
};

const sendFail = (res: Response, fields: Record<string, string>): void => {
  const body: ApiFail = { status: 'fail', data: fields };
  res.status(400).json(body);
};

/**
 * The only place `fail`/`error` envelopes are produced (docs/TRADEOFFS.md §5).
 * Must be the last middleware in the chain.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof FieldValidationError) {
    sendFail(res, err.fields);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Unexpected application error', { message: err.message, stack: err.stack });
    }
    sendError(res, err.statusCode, err.message, err.code);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint — surface as a fail on the offending field so the
        // client can show it inline (e.g. duplicate employee email). Prisma 7
        // driver adapters report the fields under driverAdapterError.cause;
        // classic engines used meta.target — support both.
        const meta = err.meta as
          | {
              target?: string[];
              driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } };
            }
          | undefined;
        const field =
          meta?.driverAdapterError?.cause?.constraint?.fields?.[0] ?? meta?.target?.[0] ?? '_';
        sendFail(res, { [field]: 'errors.validation.common.alreadyExists' });
        return;
      }
      case 'P2025':
        sendError(res, 404, 'Record not found', 'NOT_FOUND');
        return;
      case 'P2003':
        sendError(res, 400, 'Related record not found', 'BAD_REQUEST');
        return;
      default:
        logger.error('Prisma error', { code: err.code, message: err.message });
        sendError(res, 500, 'Database error', 'INTERNAL');
        return;
    }
  }

  // Unknown/unexpected — log everything, leak nothing
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  sendError(
    res,
    500,
    env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    'INTERNAL'
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 404, `Cannot ${req.method} ${req.path}`, 'NOT_FOUND');
};
