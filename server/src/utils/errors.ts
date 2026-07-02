// Error hierarchy for the JSend envelope (docs/TRADEOFFS.md §5).
// `code` is machine-readable and doubles as the client's translation key
// (errors.codes.<CODE> in shared/locales) — keep the two lists in sync.

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 400 with a field→locale-key map — the only error that produces the `fail`
 * envelope; everything else produces `error`.
 */
export class FieldValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super('Validation failed', 400, 'VALIDATION');
    this.fields = fields;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'AUTH_UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later', code = 'RATE_LIMITED') {
    super(message, 429, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL', false);
  }
}
