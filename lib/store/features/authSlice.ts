import { createSlice } from '@reduxjs/toolkit';
import type { AuthUser } from '@/lib/api/authApi';
import {
  forgotPasswordResendUser,
  forgotPasswordUser,
  resendOtpUser,
  resetPasswordUser,
  signinUser,
  signupUser,
  verifyOtpUser,
} from '@/lib/api/authActions';
import { logoutApi } from '@/lib/api/authApi';
import { startRefreshWatch } from '@/lib/auth/refresh';
import { extractSessionTokens } from '@/lib/auth/sessionTokens';
import {
  clearAuthData,
  getRefreshToken,
  getToken,
  isJwtExpired,
  setRefreshToken,
  setToken,
  setTokenExpiry,
} from '@/lib/utils/tokenStorage';
import { clearAllCached } from '@/lib/api/cache';

const USER_KEY = 'authUser';

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  pendingEmail: string | null;
  pendingMobile: string | null;
  content?: unknown;
  sessionInfo?: { RoleId?: number } | null;
  profileInfo?: unknown;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  loading: false,
  error: null,
  otpSent: false,
  pendingEmail: null,
  pendingMobile: null,
};

function accessTokenOf(payload: unknown) {
  return extractSessionTokens(payload).accessToken;
}

function persistSession(token: string, user: AuthUser, payload?: unknown) {
  const extras = extractSessionTokens(payload);
  clearAllCached();
  setToken(token);
  if (extras.refreshToken) {
    setRefreshToken(extras.refreshToken);
  }
  if (extras.expiresIn) {
    setTokenExpiry(Date.now() + extras.expiresIn * 1000);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  startRefreshWatch();
}

function otpMeta(email?: string, mobile?: string) {
  return {
    otpSent: true,
    pendingEmail: email || null,
    pendingMobile: mobile || null,
    error: null,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        void logoutApi(refreshToken).catch(() => undefined);
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.pendingEmail = null;
      state.pendingMobile = null;
      state.error = null;
      clearAuthData();
      clearAllCached();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
    setAuthSession(state, action: { payload: { token: string; user: AuthUser; refreshToken?: string; expiresIn?: number } }) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.otpSent = false;
      persistSession(action.payload.token, action.payload.user, action.payload);
    },
    updateAccessToken(state, action: { payload: string }) {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    rehydrateAuth(state) {
      const token = getToken();
      const refreshToken = getRefreshToken();
      const raw = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
      if (!token || isJwtExpired(token)) {
        if (token || refreshToken) {
          clearAuthData();
          if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_KEY);
          }
        }
      } else if (token && raw) {
        try {
          state.token = token;
          state.user = JSON.parse(raw) as AuthUser;
          state.isAuthenticated = true;
        } catch {
          clearAuthData();
        }
      }
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: AuthState, action: { payload: unknown }) => {
      state.loading = false;
      state.error = typeof action.payload === 'string' ? action.payload : 'Request failed';
    };

    builder
      .addCase(signupUser.pending, pending)
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        Object.assign(
          state,
          otpMeta(
            action.payload.user?.email || action.meta.arg.email,
            action.payload.user?.mobile || action.meta.arg.mobile,
          ),
        );
      })
      .addCase(signupUser.rejected, rejected)
      .addCase(signinUser.pending, pending)
      .addCase(signinUser.fulfilled, (state, action) => {
        const token = accessTokenOf(action.payload);
        state.loading = false;
        state.hydrated = true;
        state.isAuthenticated = true;
        state.token = token;
        state.user = action.payload.user;
        state.otpSent = false;
        persistSession(token, action.payload.user, action.payload);
      })
      .addCase(signinUser.rejected, rejected)
      .addCase(resendOtpUser.pending, pending)
      .addCase(resendOtpUser.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, otpMeta(action.payload.email, action.payload.mobile));
      })
      .addCase(resendOtpUser.rejected, rejected)
      .addCase(forgotPasswordUser.pending, pending)
      .addCase(forgotPasswordUser.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, otpMeta(action.payload.email, action.payload.mobile));
      })
      .addCase(forgotPasswordUser.rejected, rejected)
      .addCase(forgotPasswordResendUser.pending, pending)
      .addCase(forgotPasswordResendUser.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, otpMeta(action.payload.email, action.payload.mobile));
      })
      .addCase(forgotPasswordResendUser.rejected, rejected)
      .addCase(verifyOtpUser.pending, pending)
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        const token = accessTokenOf(action.payload);
        state.loading = false;
        state.hydrated = true;
        state.isAuthenticated = true;
        state.token = token;
        state.user = action.payload.user;
        state.otpSent = false;
        persistSession(token, action.payload.user, action.payload);
      })
      .addCase(verifyOtpUser.rejected, rejected)
      .addCase(resetPasswordUser.pending, pending)
      .addCase(resetPasswordUser.fulfilled, (state, action) => {
        const token = accessTokenOf(action.payload);
        state.loading = false;
        state.hydrated = true;
        state.isAuthenticated = true;
        state.token = token;
        state.user = action.payload.user;
        state.otpSent = false;
        persistSession(token, action.payload.user, action.payload);
      })
      .addCase(resetPasswordUser.rejected, rejected);
  },
});

export const { logout, clearAuthError, rehydrateAuth, setAuthSession, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;
