import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/store';

/**
 * Hook to handle automatic token refresh and show signin modal on failure
 */
export const useTokenRefresh = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleShowSigninModal = () => {
      // Dispatch an action to show the signin modal
      // You can customize this based on your modal management system
      console.log('Refresh token failed, showing signin modal');
      
      // If you have a global modal state, dispatch an action to show it
      // dispatch(showSigninModal());
      
      // Or trigger a custom event that your modal component listens to
      window.dispatchEvent(new CustomEvent('openSigninModal'));
    };

    // Listen for the custom event from the refresh token interceptor
    window.addEventListener('showSigninModal', handleShowSigninModal);

    return () => {
      window.removeEventListener('showSigninModal', handleShowSigninModal);
    };
  }, [dispatch]);
}; 