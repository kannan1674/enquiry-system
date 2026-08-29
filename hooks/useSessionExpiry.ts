import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/store';
import { handleSessionExpiry } from '@/lib/utils/sessionExpiryHandler';
import { getCookie } from '@/lib/utils/cookieUtils';

type SessionExpiryResult = 'refreshed' | 'expired' | 'pending';

/**
 * Hook to monitor session expiry and automatically logout when session expires
 */
export const useSessionExpiry = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.authState.isAuthenticated);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastExpiryRef = useRef<number | null>(null);
  const handlingExpiryRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  const triggerSessionExpiry = useCallback(async (): Promise<SessionExpiryResult> => {
    if (handlingExpiryRef.current) {
      return 'pending';
    }

    handlingExpiryRef.current = true;
    try {
      console.log('🔄 [SessionExpiry] Attempting automatic token refresh...');
      const { refreshToken } = await import('@/lib/Actions/authActions');
      const refreshTokenThunk = refreshToken();
      await dispatch(refreshTokenThunk as any);
      console.log('🔄 [SessionExpiry] Token refresh completed successfully.');
      return 'refreshed';
    } catch (error) {
      console.error('⚠️ [SessionExpiry] Automatic token refresh failed:', error);
      clearTimers();
      await handleSessionExpiry(dispatch);
      return 'expired';
    } finally {
      handlingExpiryRef.current = false;
    }
  }, [dispatch, clearTimers]);

  const attemptSessionRefresh = useCallback(
    (onSuccess?: () => void, onFailure?: () => void) => {
      void triggerSessionExpiry().then((result) => {
        if (result === 'refreshed') {
          onSuccess?.();
        } else if (result === 'expired') {
          onFailure?.();
        }
      });
    },
    [triggerSessionExpiry]
  );

  const scheduleExpiryTimeout = useCallback(() => {
    const expiryCookie = getCookie('tokenExpiry');

    if (!expiryCookie) {
      lastExpiryRef.current = null;
      const handleSuccess = () => {
        void Promise.resolve().then(() => {
          scheduleExpiryTimeout();
        });
      };
      attemptSessionRefresh(handleSuccess, clearTimers);
      return;
    }

    const expiryTimestamp = Number(expiryCookie);

    if (!Number.isFinite(expiryTimestamp)) {
      lastExpiryRef.current = null;
      const handleSuccess = () => {
        void Promise.resolve().then(() => {
          scheduleExpiryTimeout();
        });
      };
      attemptSessionRefresh(handleSuccess, clearTimers);
      return;
    }

    lastExpiryRef.current = expiryTimestamp;

    const timeUntilExpiry = expiryTimestamp - Date.now();

    if (timeUntilExpiry <= 0) {
      const handleSuccess = () => {
        void Promise.resolve().then(() => {
          scheduleExpiryTimeout();
        });
      };
      attemptSessionRefresh(handleSuccess, clearTimers);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const handleSuccess = () => {
        void Promise.resolve().then(() => {
          scheduleExpiryTimeout();
        });
      };
      attemptSessionRefresh(handleSuccess, clearTimers);
    }, timeUntilExpiry);
  }, [attemptSessionRefresh, clearTimers]);

  useEffect(() => {
    // Only monitor session if user is authenticated
    if (!isAuthenticated) {
      // Clear any existing interval
      clearTimers();
      lastExpiryRef.current = null;
      handlingExpiryRef.current = false;
      return;
    }

    // Immediately schedule timeout based on the token expiry value
    scheduleExpiryTimeout();

    // Keep syncing the timeout when the cookie value changes (e.g. refresh token)
    syncIntervalRef.current = setInterval(() => {
      const expiryCookie = getCookie('tokenExpiry');
      const expiryTimestamp = expiryCookie ? Number(expiryCookie) : NaN;

      if (!expiryCookie || !Number.isFinite(expiryTimestamp)) {
        const handleSuccess = () => {
          void Promise.resolve().then(() => {
            scheduleExpiryTimeout();
          });
        };
        attemptSessionRefresh(handleSuccess, clearTimers);
        return;
      }

      if (lastExpiryRef.current !== expiryTimestamp) {
        scheduleExpiryTimeout();
      }
    }, 15000); // Re-evaluate every 15 seconds

    // Cleanup function
    return () => {
      clearTimers();
    };
  }, [attemptSessionRefresh, clearTimers, isAuthenticated, scheduleExpiryTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);
};
