// JSend-style three-state envelope (docs/TRADEOFFS.md §5).
// Route handlers only ever produce `success`; the server's validation and
// error-handling middleware produce `fail` and `error`.

/** 2xx — request succeeded, `data` is the payload. */
export interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

/**
 * 400/422 — client-side problem (validation, bad input).
 * `data` is a field→message map matching Zod's flattened error shape,
 * so it drops straight into Formik field errors.
 */
export interface ApiFail {
  status: 'fail';
  data: Record<string, string>;
}

/** 401/403/404/500 — server-side problem (exception, auth failure, not found). */
export interface ApiError {
  status: 'error';
  message: string;
  code: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFail | ApiError;

/** Shape of `data` for server-side paginated list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
