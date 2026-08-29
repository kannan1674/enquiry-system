import { store } from './store/store';
import { refreshToken } from './Actions/authActions';
import { isTokenExpired, shouldRefreshToken } from './utils/tokenUtils';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Refresh token interceptor that handles automatic token refresh
 */
export const refreshTokenInterceptor = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  if (!shouldRefreshToken()) {
    return apiCall();
  }

  if (isRefreshing) {
    // If already refreshing, wait for the refresh to complete
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(() => apiCall());
  }

  isRefreshing = true;

  try {
    const refreshTokenThunk = refreshToken();
    await store.dispatch(refreshTokenThunk as any);
    
    // Tokens are stored in secure cookies; notify queue without exposing token
    processQueue(null, null);
    
    return apiCall();
  } catch (error) {
    processQueue(error, null);
    
    // Session expiry handling removed - relying on server-side cookies
    
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Manual refresh token function
 */
export const manualRefreshToken = async (): Promise<boolean> => {
  try {
    if (shouldRefreshToken()) {
      const refreshTokenThunk = refreshToken();
      await store.dispatch(refreshTokenThunk as any);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Manual token refresh failed:', error);
    return false;
  }
};

/**
 * Check if user is authenticated and token is valid
 */
export const isAuthenticatedAndValid = (): boolean => {
  const state = store.getState();
  const { isAuthenticated, token } = state.authState;
  
  if (!isAuthenticated || !token) {
    return false;
  }
  
  return !isTokenExpired();
}; 

export { shouldRefreshToken };
