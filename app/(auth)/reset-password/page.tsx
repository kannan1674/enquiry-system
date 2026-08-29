'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCard } from '../components/auth-card';
import { AuthOutlinedInput } from '../components/auth-outlined-input';
import { AuthPasswordInput } from '../components/auth-password-input';
import { AuthOtpField } from '../components/auth-otp-field';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { AuthResendButton } from '../components/auth-resend-button';
import { resendOtpUser, resetPasswordUser } from '@/lib/api/authActions';
import { clearAuthError } from '@/lib/store/features/authSlice';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/auth/schemas';
import { toastFormErrors } from '@/lib/auth/toastFormErrors';
import { showError, showSuccess } from '@/lib/utils/toast';
import { ScreenLoader } from '@/components/common/screen-loader';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, isAuthenticated } = useAppSelector((state) => state.auth);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    dispatch(clearAuthError());
    const fromQuery = searchParams.get('email');
    if (fromQuery) {
      form.setValue('email', fromQuery);
    }
  }, [dispatch, form, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleResend = async () => {
    const email = form.getValues('email').trim().toLowerCase();
    const result = await dispatch(resendOtpUser({ email, purpose: 'reset' }));
    if (resendOtpUser.fulfilled.match(result)) {
      showSuccess('OTP resent. Check your email');
      form.setValue('otp', '');
      return true;
    }
    showError((result.payload as string) || 'Failed to resend OTP');
    return false;
  };

  const handleSubmit = form.handleSubmit(
    async ({ email, otp, password, confirmPassword }) => {
      const result = await dispatch(
        resetPasswordUser({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          password,
          confirmPassword,
        }),
      );

      if (resetPasswordUser.fulfilled.match(result)) {
        showSuccess('Password reset successful');
        router.replace('/');
      } else {
        showError((result.payload as string) || 'Reset failed');
      }
    },
    toastFormErrors,
  );

  return (
    <>
    {loading ? <ScreenLoader message="Updating password..." /> : null}
    <AuthCard
      icon={<ShieldCheck className="size-5" />}
      title="Reset password"
      subtitle="Enter the OTP sent to your email and choose a new password."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthOutlinedInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.watch('email')}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <AuthOtpField
          value={form.watch('otp')}
          onChange={(value) => form.setValue('otp', value, { shouldValidate: true })}
          error={form.formState.errors.otp?.message}
          hint="Enter the 6-digit code emailed to you"
        />
        <AuthPasswordInput
          id="password"
          label="New password"
          showStrength
          value={form.watch('password')}
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <AuthPasswordInput
          id="confirmPassword"
          label="Confirm password"
          value={form.watch('confirmPassword')}
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Reset Password'}
        </Button>
        <AuthResendButton onResend={handleResend} disabled={loading} />
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Back to{' '}
        <Link href="/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ScreenLoader message="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
