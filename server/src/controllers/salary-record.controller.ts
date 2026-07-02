import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '@utils/api-response';
import { addSalaryRecord, getHistory } from '@services/salary-record.service';

export const history = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await getHistory(req.params['id']!));
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await addSalaryRecord(req.params['id']!, req.body), 201);
  } catch (error) {
    next(error);
  }
};
