import { signOutExpiredSession } from '@/lib/auth/session';
import { getToken, isJwtExpired } from '@/lib/utils/tokenStorage';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://enquiry-api.vercel.app')
  .replace(/^['"]|['"]$/g, '')
  .replace(/\/$/, '');

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE}${normalized}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { success?: boolean; message?: string } & T;

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    auth?: boolean;
    sameOrigin?: boolean;
  } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, sameOrigin = false } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (!token || isJwtExpired(token)) {
      signOutExpiredSession();
      throw new Error('Your session has expired. Please sign in again.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = sameOrigin ? `/api${normalized}` : `${API_BASE}/api${normalized}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body != null && method !== 'GET' ? JSON.stringify(body) : undefined,
  });

  if (auth && response.status === 401) {
    signOutExpiredSession();
    throw new Error('Your session has expired. Please sign in again.');
  }

  const data = (await response.json()) as { success?: boolean; message?: string } & T;

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
