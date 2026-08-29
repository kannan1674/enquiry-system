import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  forgotPasswordApi,
  forgotPasswordResendApi,
  resendOtpApi,
  resetPasswordApi,
  signinApi,
  signupApi,
  verifyOtpApi,
} from './authApi';

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (
    payload: {
      name: string;
      email?: string;
      mobile?: string;
      accountKind?: 'direct' | 'agency';
      companyName?: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue },
  ) => {
    try {
      return await signupApi(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Signup failed');
    }
  },
);

export const signinUser = createAsyncThunk(
  'auth/signin',
  async (payload: { email?: string; mobile?: string; password: string }, { rejectWithValue }) => {
    try {
      return await signinApi(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign in failed');
    }
  },
);

export const verifyOtpUser = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { email?: string; mobile?: string; otp: string },
    { rejectWithValue },
  ) => {
    try {
      return await verifyOtpApi(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'OTP verification failed');
    }
  },
);

export const resendOtpUser = createAsyncThunk(
  'auth/resendOtp',
  async (
    payload: { email?: string; mobile?: string; purpose?: 'verify' | 'reset' },
    { rejectWithValue },
  ) => {
    try {
      const data = await resendOtpApi(payload);
      return { data, email: payload.email, mobile: payload.mobile };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to resend OTP');
    }
  },
);

export const forgotPasswordUser = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: { email?: string; mobile?: string }, { rejectWithValue }) => {
    try {
      const data = await forgotPasswordApi(payload);
      return { data, email: payload.email, mobile: payload.mobile };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Request failed');
    }
  },
);

export const forgotPasswordResendUser = createAsyncThunk(
  'auth/forgotPasswordResend',
  async (payload: { email?: string; mobile?: string }, { rejectWithValue }) => {
    try {
      const data = await forgotPasswordResendApi(payload);
      return { data, email: payload.email, mobile: payload.mobile };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Request failed');
    }
  },
);

export const resetPasswordUser = createAsyncThunk(
  'auth/resetPassword',
  async (
    payload: {
      email?: string;
      mobile?: string;
      otp: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue },
  ) => {
    try {
      return await resetPasswordApi(payload);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Reset failed');
    }
  },
);
