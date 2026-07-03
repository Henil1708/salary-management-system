import { NextFunction, Request, Response } from 'express';
import { PayrollItemsQuery } from '@salary/shared';
import { sendSuccess } from '@utils/api-response';
import {
  createPayrollRun,
  getPayrollRun,
  listPayrollRuns,
  payAll,
  setItemPaid,
} from '@services/payroll.service';

export const listRuns = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await listPayrollRuns());
  } catch (error) {
    next(error);
  }
};

export const createRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await createPayrollRun(req.body.period), 201);
  } catch (error) {
    next(error);
  }
};

export const getRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // query validated + coerced by validateRequest(payrollItemsQuerySchema)
    sendSuccess(res, await getPayrollRun(req.params['id']!, req.query as unknown as PayrollItemsQuery));
  } catch (error) {
    next(error);
  }
};

export const markItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await setItemPaid(req.params['id']!, req.params['itemId']!, req.body.paid);
    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

export const markAllPaid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // same filters as the list → pays only the filtered subset
    await payAll(req.params['id']!, req.query as unknown as PayrollItemsQuery);
    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};
