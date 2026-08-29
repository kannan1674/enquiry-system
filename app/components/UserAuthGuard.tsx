'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/store';
import { showError } from '@/lib/utils/toast';

interface UserAuthGuardProps {
  children: React.ReactNode;
}

export function UserAuthGuard({ children }: UserAuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const isAuthenticated = useAppSelector((state) => state.authState.isAuthenticated);
  const roleId = useAppSelector((state) => state.authState.user?.RoleId);
  const authLoading = useAppSelector((state) => state.authState.loading);

  // Get role from cookies as fallback
  const getRoleFromCookies = () => {
    if (typeof window === 'undefined') return undefined;
    const cookies = document.cookie.split(';');
    const roleCookie = cookies.find(cookie => cookie.trim().startsWith('userRoleId='));
    return roleCookie ? parseInt(roleCookie.split('=')[1]) : undefined;
  };

  useEffect(() => {
    const checkAuthorization = () => {
      // Wait for auth loading to complete
      if (authLoading) {
        return;
      }

      let userRole = roleId;
      
      // If no role from Redux, try cookies
      if (!userRole) {
        userRole = getRoleFromCookies();
      }

      console.log('🔐 [UserAuthGuard] Authorization check:', {
        isAuthenticated,
        roleId,
        userRole,
        authLoading
      });

      // Allow access if:
      // 1. User is not authenticated (guest access)
      // 2. User is authenticated with roleId = 2 (regular user)
      if (!isAuthenticated || (isAuthenticated && userRole === 2)) {
        console.log('✅ [UserAuthGuard] User is authorized to access Home page');
        setIsAuthorized(true);
        setIsChecking(false);
      } else if (isAuthenticated && userRole === 1) {
        console.log('❌ [UserAuthGuard] Admin user trying to access Home page - redirecting to dashboard');
        router.push('/dashboard');
        setIsChecking(false);
      } else {
        console.log('❌ [AdminAuthGuard] Unknown authorization state');
        showError('403 Unauthorized: Access denied');
        router.push('/Home');
        setIsChecking(false);
      }
    };

    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(checkAuthorization, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, roleId, authLoading, router]);

  // Show loading state while checking authorization
  if (isChecking) {
    return (
      <div className="grow bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Return null if not authorized (redirect will happen)
  return null;
}
