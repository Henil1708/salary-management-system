import { NextFunction, Request, Response } from 'express';
import { EmployeeListQuery } from '@salary/shared';
import { sendSuccess } from '@utils/api-response';
import {
  createEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from '@services/employee.service';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // validated + coerced by validateRequest(employeeListQuerySchema)
    sendSuccess(res, await listEmployees(req.query as unknown as EmployeeListQuery));
  } catch (error) {
    next(error);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await getEmployee(req.params['id']!));
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await createEmployee(req.body), 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await updateEmployee(req.params['id']!, req.body));
  } catch (error) {
    next(error);
  }
};
