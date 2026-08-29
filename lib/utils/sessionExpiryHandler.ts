import { showError } from './toast';
import { clearAuthData } from './tokenStorage';
import { isTokenExpired } from './tokenUtils';

/**
 * Handles session expiration by showing toast, clearing auth data, and triggering logout
 */
export const handleSessionExpiry = async (dispatch: any) => {
  console.log('🔐 [SessionExpiry] Handling session expiry...');
  
  // Show error toast
  showError('Your session has expired. Please log in again.');
  
  // Clear all auth data
  clearAuthData();
  
  // Dispatch logout action to clear Redux state
  const { logout } = await import('@/lib/Actions/authActions');
  await dispatch(logout());
  
  console.log('🔐 [SessionExpiry] Session expiry handled - user logged out');
};

/**
 * Checks if an error indicates session expiration
 */
export const isSessionExpiredError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' ? error : error.message || error.error || '';
  const errorStatus = error.status || error.statusCode;
  
  return (
    errorStatus === 401 ||
    errorMessage.toLowerCase().includes('session expired') ||
    errorMessage.toLowerCase().includes('token expired') ||
    errorMessage.toLowerCase().includes('unauthorized') ||
    errorMessage.toLowerCase().includes('authentication required') ||
    errorMessage.toLowerCase().includes('invalid token') ||
    errorMessage.toLowerCase().includes('authorization token required')
  );
};

/**
 * Checks if the current session is expired based on token expiry
 */
export const checkSessionExpiry = (): boolean => {
  return isTokenExpired();
};

/**
 * Wrapper function to handle API responses and automatically handle session expiry
 */
export const handleApiResponse = async <T>(
  apiCall: () => Promise<T>,
  dispatch?: any
): Promise<T> => {
  try {
    // Check if session is already expired before making the call
    if (checkSessionExpiry()) {
      console.log('🔐 [SessionExpiry] Session already expired, handling expiry...');
      if (dispatch) {
        await handleSessionExpiry(dispatch);
      }
      throw new Error('Session expired');
    }
    
    return await apiCall();
  } catch (error) {
    if (isSessionExpiredError(error)) {
      console.log('🔐 [SessionExpiry] Session expired error detected, handling...');
      if (dispatch) {
        await handleSessionExpiry(dispatch);
      }
    }
    throw error;
  }
};
