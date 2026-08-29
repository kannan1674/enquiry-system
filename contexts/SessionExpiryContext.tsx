'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthModalManager from '@/app/(auth)/components/SignInForm';

interface SessionExpiryContextType {
  showSigninModal: boolean;
  setShowSigninModal: (show: boolean) => void;
  triggerSigninModal: () => void;
}

const SessionExpiryContext = createContext<SessionExpiryContextType | undefined>(undefined);

interface SessionExpiryProviderProps {
  children: ReactNode;
}

export function SessionExpiryProvider({ children }: SessionExpiryProviderProps) {
  const [showSigninModal, setShowSigninModal] = useState(false);

  const triggerSigninModal = () => {
    console.log('🔐 [SessionExpiry] Triggering signin modal due to session expiration');
    setShowSigninModal(true);
  };

  const handleModalClose = () => {
    console.log('🔐 [SessionExpiry] Signin modal closed');
    setShowSigninModal(false);
  };

  return (
    <SessionExpiryContext.Provider
      value={{
        showSigninModal,
        setShowSigninModal,
        triggerSigninModal,
      }}
    >
      {children}
      
      {/* Signin Modal */}
      {showSigninModal && (
        <AuthModalManager
          initialMode="signin"
          onClose={handleModalClose}
        />
      )}
    </SessionExpiryContext.Provider>
  );
}

export function useSessionExpiry() {
  const context = useContext(SessionExpiryContext);
  if (context === undefined) {
    throw new Error('useSessionExpiry must be used within a SessionExpiryProvider');
  }
  return context;
}
