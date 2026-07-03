import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '@utils/api-response';
import { createUser, listUsers } from '@services/user.service';

export const list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await listUsers());
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await createUser(req.body), 201);
  } catch (error) {
    next(error);
  }
};
