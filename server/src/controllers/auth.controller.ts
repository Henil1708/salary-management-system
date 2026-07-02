import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '@utils/api-response';
import {
  getProfile,
  issueTokens,
  requestPasswordReset,
  resetPassword as resetPasswordService,
  toPublicUser,
} from '@services/auth.service';

// req.user is set by requireLocalCredentials (full DB user attached)
export const login = (req: Request, res: Response): void => {
  const { userId, tokenVersion, user } = req.user!;
  sendSuccess(res, {
    user: toPublicUser(user!),
    ...issueTokens({ id: userId, tokenVersion }),
  });
};

// req.user is set by requireRefreshToken (tokenVersion already re-checked
// against the DB by the jwt-refresh strategy)
export const refresh = (req: Request, res: Response): void => {
  const { userId, tokenVersion } = req.user!;
  sendSuccess(res, issueTokens({ id: userId, tokenVersion }));
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await requestPasswordReset(req.body.identifier);
    // Same response whether or not the account exists — no user enumeration
    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await resetPasswordService(req.body.token, req.body.newPassword);
    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, await getProfile(req.user!.userId));
  } catch (error) {
    next(error);
  }
};
