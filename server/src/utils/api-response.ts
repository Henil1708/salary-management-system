import { Response } from 'express';
import { ApiSuccess } from '@salary/shared';

// Controllers only ever produce the `success` envelope; `fail` and `error`
// are produced exclusively by the error-handling middleware
// (docs/TRADEOFFS.md §5).
export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): void => {
  const body: ApiSuccess<T> = { status: 'success', data };
  res.status(statusCode).json(body);
};
