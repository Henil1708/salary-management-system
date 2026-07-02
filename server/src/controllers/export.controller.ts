import { NextFunction, Request, Response } from 'express';
import { EmployeeListQuery } from '@salary/shared';
import { exportEmployeesCsv } from '@services/export.service';

export const exportCsv = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const csv = await exportEmployeesCsv(req.query as unknown as EmployeeListQuery);
    res
      .status(200)
      .set({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="employees.csv"',
      })
      .send(csv);
  } catch (error) {
    next(error);
  }
};
