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

export const summary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await getSummary());
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
      await getSalaryByDimension(req.query['dimension'] as DashboardDimension)
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
    sendSuccess(res, await getPayBands());
  } catch (error) {
    next(error);
  }
};

export const payrollTrend = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    sendSuccess(res, await getPayrollTrend());
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
    sendSuccess(res, await getRecentChanges(req.query['limit'] as unknown as number));
  } catch (error) {
    next(error);
  }
};
