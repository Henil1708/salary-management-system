import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@salary/shared';
import { env } from '@/shared/config/env';
import { tokenStorage } from '@/shared/services/token-storage';

// The client half of the API contract (docs/TRADEOFFS.md §4–5):
//  - unwraps the JSend envelope, so callers get `data` or a typed throw
//  - `fail` → ApiFieldError with the field→locale-key map (drops into Formik)
//  - `error` → ApiCodeError; the UI translates `code` via errors.codes.*
//  - a 401 triggers ONE silent token refresh; concurrent 401s queue behind it

/** 400 `fail` envelope — field→locale-key map matching Zod/Formik. */
export class ApiFieldError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super('Validation failed');
  }
}

/** `error` envelope — code doubles as the errors.codes.* translation key. */
export class ApiCodeError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const instance = axios.create({ baseURL: env.API_URL });

instance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// --- silent refresh (single-flight) -----------------------------------------

let refreshPromise: Promise<void> | null = null;

const refreshTokens = async (): Promise<void> => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new ApiCodeError('AUTH_TOKEN_EXPIRED', 'No refresh token');
  }
  // bare axios: the refresh call must not run through the interceptors
  const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    `${env.API_URL}/auth/refresh`,
    null,
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  );
  if (response.data.status !== 'success') {
    throw new ApiCodeError('AUTH_TOKEN_EXPIRED', 'Refresh failed');
  }
  tokenStorage.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
};

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => undefined;

/** Registered once by the auth feature — dispatches LOGOUT + redirects. */
export const setSessionExpiredHandler = (handler: SessionExpiredHandler): void => {
  onSessionExpired = handler;
};

// -----------------------------------------------------------------------------

const toTypedError = (body: ApiResponse<unknown>): ApiFieldError | ApiCodeError => {
  if (body.status === 'fail') {
    return new ApiFieldError(body.data);
  }
  if (body.status === 'error') {
    return new ApiCodeError(body.code, body.message);
  }
  return new ApiCodeError('INTERNAL', 'Unexpected response shape');
};

const AUTH_PATHS_WITHOUT_REFRESH = ['/auth/login', '/auth/refresh'];

const request = async <T>(config: AxiosRequestConfig, isRetry = false): Promise<T> => {
  try {
    const response = await instance.request<ApiResponse<T>>(config);
    const body = response.data;
    if (body.status === 'success') {
      return body.data;
    }
    throw toTypedError(body);
  } catch (error) {
    if (error instanceof ApiFieldError || error instanceof ApiCodeError) {
      throw error;
    }

    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const body = axiosError.response?.data;
    const status = axiosError.response?.status;

    const isRefreshable =
      status === 401 &&
      !isRetry &&
      !AUTH_PATHS_WITHOUT_REFRESH.some((path) => config.url?.startsWith(path));

    if (isRefreshable) {
      try {
        refreshPromise = refreshPromise ?? refreshTokens();
        await refreshPromise;
      } catch {
        tokenStorage.clear();
        onSessionExpired();
        throw body ? toTypedError(body) : new ApiCodeError('AUTH_TOKEN_EXPIRED', 'Session expired');
      } finally {
        refreshPromise = null;
      }
      // fresh access token is now in storage — retry the original call once
      return request<T>({ ...config, headers: { ...config.headers, Authorization: undefined } }, true);
    }

    if (body && typeof body === 'object' && 'status' in body) {
      throw toTypedError(body);
    }
    throw new ApiCodeError('NETWORK', axiosError.message);
  }
};

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data }),
  /** For file downloads — returns the raw blob, no envelope unwrapping. */
  getBlob: async (url: string, config?: AxiosRequestConfig): Promise<Blob> => {
    const response = await instance.get<Blob>(url, { ...config, responseType: 'blob' });
    return response.data;
  },
};
