import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { loginSchema } from '@salary/shared';
import { validateRequest } from '@middleware/validate';
import { FieldValidationError } from '@utils/errors';

const runMiddleware = async (schemas: Parameters<typeof validateRequest>[0], body: unknown) => {
  const req = { body, query: {}, params: {} } as Request;
  const next = jest.fn() as NextFunction;
  await validateRequest(schemas)(req, {} as Response, next);
  return { req, next: next as jest.Mock };
};

describe('validateRequest', () => {
  it('passes a valid body through with parsed/trimmed output', async () => {
    const { req, next } = await runMiddleware(
      { body: loginSchema },
      { identifier: '  hr@acme.com  ', password: 'pw' }
    );
    expect(next).toHaveBeenCalledWith();
    expect(req.body.identifier).toBe('hr@acme.com');
  });

  it('maps failures to a field→locale-key map (fail envelope shape)', async () => {
    const { next } = await runMiddleware({ body: loginSchema }, {});
    const error = next.mock.calls[0][0] as FieldValidationError;
    expect(error).toBeInstanceOf(FieldValidationError);
    expect(error.fields).toEqual({
      identifier: 'errors.validation.auth.identifierRequired',
      password: 'errors.validation.auth.passwordRequired',
    });
  });

  it('keeps only the first message per field', async () => {
    const { next } = await runMiddleware(
      { body: loginSchema },
      { identifier: '   ', password: '' }
    );
    const error = next.mock.calls[0][0] as FieldValidationError;
    expect(Object.keys(error.fields)).toEqual(['identifier', 'password']);
  });

  it('replaces non-locale-key Zod defaults with the generic key', async () => {
    // schema without custom messages — Zod would emit English defaults
    const { next } = await runMiddleware({ body: z.object({ n: z.number() }) }, { n: 'NaN' });
    const error = next.mock.calls[0][0] as FieldValidationError;
    expect(error.fields['n']).toBe('errors.validation.common.invalid');
  });
});
