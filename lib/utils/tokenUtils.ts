import { getCookie } from './cookieUtils';

/**
 * Check if the current token is expired
 */
export const isTokenExpired = (): boolean => {
  const tokenExpiry = getCookie('tokenExpiry');
  if (!tokenExpiry) {
    return true;
  }

  const expiryTime = parseInt(tokenExpiry, 10);
  const currentTime = Date.now();

  if (Number.isNaN(expiryTime)) {
    return true;
  }

  return currentTime >= expiryTime;
};

/**
 * Check if refresh token should be attempted
 */
export const shouldRefreshToken = (): boolean => {
  const tokenExpiry = getCookie('tokenExpiry');
  const hasRefreshToken = Boolean(getCookie('refreshToken'));

  if (!tokenExpiry) {
    return hasRefreshToken;
  }

  const expiryTime = parseInt(tokenExpiry, 10);
  if (Number.isNaN(expiryTime)) {
    return hasRefreshToken;
  }

  const currentTime = Date.now();
  const timeUntilExpiry = expiryTime - currentTime;

  if (timeUntilExpiry <= 0) {
    return hasRefreshToken;
  }

  const maxBuffer = 5 * 60 * 1000; // 5 minutes
  const minBuffer = 60 * 1000; // 1 minute
  const adaptiveBuffer = Math.min(
    maxBuffer,
    Math.max(minBuffer, Math.floor(timeUntilExpiry / 4))
  );

  return hasRefreshToken && timeUntilExpiry <= adaptiveBuffer;
};

/**
 * Get current token. Tokens are stored in HTTP-only cookies and cannot be
 * accessed via JavaScript, so this helper returns null.
 */
export const getCurrentToken = (): string | null => {
  return null;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  document.cookie = 'authToken=; Max-Age=0; path=/';
  document.cookie = 'refreshToken=; Max-Age=0; path=/';
  document.cookie = 'tokenExpiry=; Max-Age=0; path=/';
  document.cookie = 'sessionId=; Max-Age=0; path=/';
};

/**
 * Set authentication data
 */
export const setAuthData = (): void => {
  // Tokens are managed via HTTP-only cookies set by the server
  return;
};