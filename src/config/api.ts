// API configuration for backend integration

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql';

// API helper functions
export async function fetchAPI(endpoint: string, options?: RequestInit) {
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

  if (!response.ok) {
    // Try to get error details from response body
    try {
      const errorData = await response.json();
      const errorMessage = errorData.error || errorData.message || response.statusText;
      throw new Error(`API error: ${errorMessage}`);
    } catch (e) {
      throw new Error(`API error: ${response.statusText}`);
    }
  }

  return response.json();
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
