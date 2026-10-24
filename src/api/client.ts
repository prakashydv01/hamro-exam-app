import { API_BASE_URL } from '@/constants/config';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '@/utils/secureStorage';
import type { ApiResponse, AuthTokens } from '@/types/api';

export class ApiError extends Error {
  status: number;
  code: string | null;
  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach Authorization header (default true)
}

// Only one refresh should ever be in flight at a time - if several requests
// 401 simultaneously, they all await this same promise instead of each
// firing their own refresh call.
let refreshPromise: Promise<AuthTokens | null> | null = null;

async function performRefresh(): Promise<AuthTokens | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json: ApiResponse<AuthTokens> = await res.json();
  if (!json.success) return null;

  await saveTokens(json.data.accessToken, json.data.refreshToken);
  return json.data;
}

/**
 * Core request function used by every src/api/*.ts file. Handles:
 * - attaching the bearer token
 * - one automatic refresh-and-retry on a 401 (TOKEN_INVALID)
 * - unwrapping the backend's { success, data } / { success, error } envelope
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (auth) {
      const token = await getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    // Try exactly one refresh-and-retry, then give up (caller/authStore
    // handles logging the user out if this still fails).
    refreshPromise = refreshPromise ?? performRefresh();
    const refreshed = await refreshPromise;
    refreshPromise = null;

    if (refreshed) {
      res = await doFetch();
    } else {
      await clearTokens();
      throw new ApiError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED');
    }
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(json.error.message, res.status, json.error.code);
  }

  return json.data;
}
