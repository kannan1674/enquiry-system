'use client';

import { useEffect } from 'react';
import { useSessionExpiry } from '@/contexts/SessionExpiryContext';
import { setSessionExpiryHandler } from '@/lib/clientApi';

export default function SessionExpiryInitializer() {
  const { triggerSigninModal } = useSessionExpiry();

  useEffect(() => {
    // Set the global session expiry handler
    setSessionExpiryHandler(triggerSigninModal);
    console.log('🔐 [SessionExpiryInitializer] Session expiry handler initialized');
    
    return () => {
      // Clean up on unmount
      setSessionExpiryHandler(() => {});
    };
  }, [triggerSigninModal]);

  return null; // This component doesn't render anything
}
