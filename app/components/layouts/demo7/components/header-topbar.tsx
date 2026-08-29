import { Button } from '@/components/ui/button';
import AuthModalManager from '@/app/(auth)/components/SignInForm';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/store/store';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

const HeaderTopbar = () => {
  const isAuthenticated = useAppSelector((state) => state.authState.isAuthenticated);
  const authState = useAppSelector((state) => state.authState);
  const adminState = useAppSelector((state) => state.adminState);
  const { content, sessionInfo, profileInfo } = authState || {};
  const { profileInfo: adminProfileInfo } = adminState || {};
  // Prioritize admin profile data, then fall back to regular profile data
  const userData = adminProfileInfo || profileInfo || sessionInfo || content;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'signin' | 'signup'>('signin');
  const hasMounted = useHasMounted();

  // Close dialog when user becomes authenticated
  useEffect(() => {
    console.log('🔐 [HeaderTopbar] Authentication state changed:', { isAuthenticated, isAuthModalOpen });
    if (isAuthenticated) {
      console.log('🔐 [HeaderTopbar] User authenticated, closing modal');
      setIsAuthModalOpen(false);
    }
  }, [isAuthenticated]);

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setInitialAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (!hasMounted) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 lg:gap-3.5">
        <>
          {!isAuthenticated && (
            <>
              <Button variant="outline" onClick={() => handleAuthClick('signin')}>
                Sign In
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => handleAuthClick('signup')}
              >
                Sign Up
              </Button>
              {isAuthModalOpen && <AuthModalManager initialMode={initialAuthMode} onClose={() => setIsAuthModalOpen(false)} />}
            </>
          )}
          {isAuthenticated && (
            <UserDropdownMenu
              trigger={
                <div className="cursor-pointer uppercase size-[34px] rounded-full inline-flex items-center justify-center relative text-lg font-medium border border-input bg-muted">
                    {(userData as { FirstName?: string })?.FirstName?.charAt(0) || 'U'}                  
                </div>
              }
            />
          )}
        </>
      
    </div>
  );
};

export { HeaderTopbar };
