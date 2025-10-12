// API configuration for backend integration

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
export const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3002/graphql';

export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: T
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API helper functions
export async function fetchAPI<T = unknown>(endpoint: string, options?: RequestInit): Promise<T | undefined> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const method = options?.method?.toUpperCase?.() ?? 'GET';
  const hasBody =
    method !== 'HEAD' &&
    response.status !== 204 &&
    response.status !== 205 &&
    response.status !== 304;

  let parsedBody: any = undefined;
  if (hasBody) {
    const contentType = response.headers.get('content-type') ?? '';
    try {
      if (contentType.includes('application/json')) {
        const text = await response.text();
        parsedBody = text ? JSON.parse(text) : undefined;
      } else {
        const text = await response.text();
        parsedBody = text || undefined;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to parse response body', error);
      }
      parsedBody = undefined;
    }
  }

  if (!response.ok) {
    const errorMessage =
      parsedBody?.error ||
      parsedBody?.message ||
      (typeof parsedBody === 'string' && parsedBody) ||
      response.statusText ||
      'Request failed';

    throw new ApiError(`API error: ${errorMessage}`, response.status, parsedBody);
  }

  return parsedBody as T;
}

// Auth token management
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
