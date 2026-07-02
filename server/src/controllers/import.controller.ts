import { NextFunction, Request, Response } from 'express';
import { SupportedLocale } from '@salary/shared';
import { sendSuccess } from '@utils/api-response';
import { BadRequestError } from '@utils/errors';
import { importEmployeesCsv } from '@services/csv-import.service';

export const importCsv = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('No CSV file attached', 'IMPORT_FILE_REQUIRED');
    }
    sendSuccess(
      res,
      await importEmployeesCsv(req.file.buffer, req.query['lang'] as SupportedLocale)
    );
  } catch (error) {
    next(error);
  }
};
