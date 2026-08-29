// Token storage utilities for localStorage

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_ID_KEY = 'sessionId';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const ACCOUNT_TYPE_ID_KEY = 'AccountTypeId';
const CSRF_TOKEN_KEY = 'csrf-token';

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set token in localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Set refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Remove refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Get session ID from localStorage
 */
export const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_ID_KEY);
};

/**
 * Set session ID in localStorage
 */
export const setSessionId = (sessionId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_ID_KEY, sessionId);
};

/**
 * Remove session ID from localStorage
 */
export const removeSessionId = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_ID_KEY);
};

/**
 * Get token expiry from localStorage
 */
export const getTokenExpiry = (): number | null => {
  if (typeof window === 'undefined') return null;
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry) : null;
};

/**
 * Set token expiry in localStorage
 */
export const setTokenExpiry = (expiry: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
};

/**
 * Remove token expiry from localStorage
 */
export const removeTokenExpiry = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Get account type ID from localStorage
 */
export const getAccountTypeId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCOUNT_TYPE_ID_KEY);
};

/**
 * Set account type ID in localStorage
 */
export const setAccountTypeId = (accountTypeId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCOUNT_TYPE_ID_KEY, accountTypeId);
};

/**
 * Remove account type ID from localStorage
 */
export const removeAccountTypeId = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCOUNT_TYPE_ID_KEY);
};

/**
 * Get CSRF token from localStorage
 */
export const getCsrfToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CSRF_TOKEN_KEY);
};

/**
 * Set CSRF token in localStorage
 */
export const setCsrfToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CSRF_TOKEN_KEY, token);
};

/**
 * Remove CSRF token from localStorage
 */
export const removeCsrfToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CSRF_TOKEN_KEY);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return Date.now() > expiry;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!(token && !isTokenExpired());
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  removeToken();
  removeRefreshToken();
  removeSessionId();
  removeTokenExpiry();
  removeAccountTypeId();
  removeCsrfToken();
};

/**
 * Set all authentication data in localStorage
 */
export const setAuthData = (data: {
  token: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
  accountTypeId?: string;
  csrfToken?: string;
}): void => {
  setToken(data.token);
  setRefreshToken(data.refreshToken);
  setSessionId(data.sessionId);
  setTokenExpiry(Date.now() + (data.expiresIn * 1000));
  
  if (data.accountTypeId) {
    setAccountTypeId(data.accountTypeId);
  }
  
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }
};

/**
 * Get all authentication data from localStorage
 */
export const getAuthData = (): {
  token: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  accountTypeId: string | null;
  csrfToken: string | null;
  isExpired: boolean;
} => {
  return {
    token: getToken(),
    refreshToken: getRefreshToken(),
    sessionId: getSessionId(),
    accountTypeId: getAccountTypeId(),
    csrfToken: getCsrfToken(),
    isExpired: isTokenExpired(),
  };
};
