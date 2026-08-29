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
import { clearAuthData, getToken, setToken } from '@/lib/utils/tokenStorage';

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

function persistSession(token: string, user: AuthUser) {
  setToken(token);
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
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
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.pendingEmail = null;
      state.pendingMobile = null;
      state.error = null;
      clearAuthData();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
    setAuthSession(state, action: { payload: { token: string; user: AuthUser } }) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.otpSent = false;
      persistSession(action.payload.token, action.payload.user);
    },
    rehydrateAuth(state) {
      const token = getToken();
      const raw = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
      if (token && raw) {
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
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.otpSent = false;
        persistSession(action.payload.token, action.payload.user);
      })
      .addCase(signupUser.rejected, rejected)
      .addCase(signinUser.pending, pending)
      .addCase(signinUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.otpSent = false;
        persistSession(action.payload.token, action.payload.user);
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
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.otpSent = false;
        persistSession(action.payload.token, action.payload.user);
      })
      .addCase(verifyOtpUser.rejected, rejected)
      .addCase(resetPasswordUser.pending, pending)
      .addCase(resetPasswordUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.otpSent = false;
        persistSession(action.payload.token, action.payload.user);
      })
      .addCase(resetPasswordUser.rejected, rejected);
  },
});

export const { logout, clearAuthError, rehydrateAuth, setAuthSession } = authSlice.actions;
export default authSlice.reducer;
