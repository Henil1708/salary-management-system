import { NextFunction, Request, Response } from 'express';
import { DashboardDimension } from '@salary/shared';
import { sendSuccess } from '@utils/api-response';
import {
  getPayBands,
  getPayrollTrend,
  getRecentChanges,
  getSalaryByDimension,
  getSummary,
} from '@services/dashboard.service';

// query params are validated + coerced by validateRequest (asOf/start/end → Date)
const asOfParam = (req: Request): Date | undefined => req.query['asOf'] as unknown as Date | undefined;

export const summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await getSummary(asOfParam(req)));
  } catch (error) {
    next(error);
  }
};

export const byDimension = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(
      res,
      await getSalaryByDimension(req.query['dimension'] as DashboardDimension, asOfParam(req))
    );
  } catch (error) {
    next(error);
  }
};

export const payBands = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(res, await getPayBands(asOfParam(_req)));
  } catch (error) {
    next(error);
  }
};

export const payrollTrend = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(res, await getPayrollTrend(asOfParam(req)));
  } catch (error) {
    next(error);
  }
};

export const recentChanges = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(
      res,
      await getRecentChanges(
        req.query['limit'] as unknown as number,
        req.query['start'] as unknown as Date | undefined,
        req.query['end'] as unknown as Date | undefined
      )
    );
  } catch (error) {
    next(error);
  }
};
