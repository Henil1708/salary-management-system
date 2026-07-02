import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { FieldValidationError } from '@utils/errors';

interface RequestSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

// Schema messages are locale keys (see docs/TRADEOFFS.md §5). Anything that
// isn't — a Zod default that slipped through without a custom message — is
// mapped to the generic key so raw English never reaches the envelope.
const LOCALE_KEY_PREFIX = 'errors.';
const GENERIC_KEY = 'errors.validation.common.invalid';

const toFieldMap = (error: ZodError): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_';
    if (!(path in fields)) {
      fields[path] = issue.message.startsWith(LOCALE_KEY_PREFIX) ? issue.message : GENERIC_KEY;
    }
  }
  return fields;
};

/**
 * Validates request parts against shared Zod schemas and replaces them with
 * the parsed output, so coerced/defaulted values flow through to handlers.
 * On failure forwards a FieldValidationError → the `fail` envelope, whose
 * field→key map drops straight into Formik on the client.
 */
export const validateRequest = (schemas: RequestSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as typeof req.query;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new FieldValidationError(toFieldMap(error)));
      } else {
        next(error);
      }
    }
  };
};
