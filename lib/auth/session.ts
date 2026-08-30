import { getRefreshToken, getToken, isJwtExpired } from '@/lib/utils/tokenStorage';

const AUTH_ROUTE = /^\/(signin|signup|forgot-password|reset-password|verify-account|invite)(\/|$)/;

let signingOut = false;

function isAuthRoute(pathname: string) {
  return AUTH_ROUTE.test(pathname);
}

export function signOutExpiredSession() {
  if (typeof window === 'undefined' || signingOut) {
    return;
  }

  const token = getToken();
  const refreshToken = getRefreshToken();
  const storedUser = localStorage.getItem('authUser');
  if (!token && !refreshToken && !storedUser) {
    return;
  }

  signingOut = true;

  void import('@/lib/store/store').then(async ({ store }) => {
    const { logout } = await import('@/lib/store/features/authSlice');
    const { showError } = await import('@/lib/utils/toast');
    store.dispatch(logout());
    showError('Your session has expired. Please sign in again.');
    if (!isAuthRoute(window.location.pathname)) {
      window.location.replace('/signin');
    }
    signingOut = false;
  });
}

export async function maintainSession() {
  const token = getToken();
  if (token && !isJwtExpired(token)) {
    return true;
  }

  if (token || getRefreshToken()) {
    signOutExpiredSession();
  }
  return false;
}
