import { apiPost } from './client';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  role: string;
  tenantId: number | null;
  authorisedClientIds: number[];
  RoleId?: number;
};

export type OtpResponse = {
  success: boolean;
  message: string;
  channel?: string;
  expiresInMinutes?: number;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
};

export type IdentifierPayload = {
  email?: string;
  mobile?: string;
};

export function signupApi(body: {
  name: string;
  email?: string;
  mobile?: string;
  accountKind?: 'direct' | 'agency';
  companyName?: string;
  password: string;
  confirmPassword: string;
}) {
  return apiPost<AuthResponse>('/api/auth/register', body);
}

export function signinApi(body: IdentifierPayload & { password: string }) {
  return apiPost<AuthResponse>('/api/auth/signin', body);
}

export function verifyOtpApi(body: IdentifierPayload & { otp: string }) {
  return apiPost<AuthResponse>('/api/auth/verify-otp', body);
}

export function forgotPasswordApi(body: IdentifierPayload) {
  return apiPost<OtpResponse>('/api/auth/forgot-password', body);
}

export function resendOtpApi(body: IdentifierPayload & { purpose?: 'verify' | 'reset' }) {
  return apiPost<OtpResponse>('/api/auth/resend-otp', body);
}

export function forgotPasswordResendApi(body: IdentifierPayload) {
  return apiPost<OtpResponse>('/api/auth/forgot-password-resend', body);
}

export function resetPasswordApi(
  body: IdentifierPayload & {
    otp: string;
    password: string;
    confirmPassword: string;
  },
) {
  return apiPost<AuthResponse>('/api/auth/reset-password', body);
}
