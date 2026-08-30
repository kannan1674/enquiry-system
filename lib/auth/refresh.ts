import {
  getAccessExpiryMs,
  getRefreshToken,
  getToken,
  isJwtExpired,
  setRefreshToken,
  setToken,
} from '@/lib/utils/tokenStorage';
import { extractSessionTokens } from '@/lib/auth/sessionTokens';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://enquiry-api.vercel.app')
  .replace(/^['"]|['"]$/g, '')
  .replace(/\/$/, '');

let refreshInFlight: Promise<string | null> | null = null;
let watchStarted = false;

export async function refreshAccessToken(): Promise<string | null> {
  const current = getRefreshToken();
  if (!current) {
    return null;
  }
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current }),
    });
    const data = (await response.json()) as { success?: boolean };
    if (!response.ok || data.success === false) {
      return null;
    }
    const extracted = extractSessionTokens(data);
    const next = extracted.accessToken || getToken();
    if (!next) {
      return null;
    }
    setToken(next);
    if (extracted.refreshToken) {
      setRefreshToken(extracted.refreshToken);
    }
    void import('@/lib/store/store').then(async ({ store }) => {
      const { updateAccessToken } = await import('@/lib/store/features/authSlice');
      store.dispatch(updateAccessToken(next));
    });
    return next;
  })()
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export async function ensureFreshAccessToken(): Promise<string | null> {
  const token = getToken();
  if (token && !isJwtExpired(token)) {
    return token;
  }
  return null;
}

export function startRefreshWatch() {
  if (typeof window === 'undefined' || watchStarted) {
    return;
  }
  watchStarted = true;

  const tick = () => {
    const token = getToken();
    if (!token) {
      return;
    }
    const expiry = getAccessExpiryMs(token);
    if (expiry != null && Date.now() >= expiry) {
      void import('@/lib/auth/session').then(({ signOutExpiredSession }) => {
        signOutExpiredSession();
      });
    }
  };

  tick();
  window.setInterval(tick, 1_000);
}
