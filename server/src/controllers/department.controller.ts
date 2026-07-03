import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '@utils/api-response';
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment,
} from '@services/department.service';

export const list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await listDepartments());
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await createDepartment(req.body), 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await updateDepartment(req.params['id']!, req.body));
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteDepartment(req.params['id']!);
    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};
