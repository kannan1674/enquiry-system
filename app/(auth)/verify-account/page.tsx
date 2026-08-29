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
import { AuthOtpField } from '../components/auth-otp-field';
import { AuthResendButton } from '../components/auth-resend-button';
import { PagePending } from '@/components/common/page-pending';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { resendOtpUser, verifyOtpUser } from '@/lib/api/authActions';
import { clearAuthError } from '@/lib/store/features/authSlice';
import { verifyAccountSchema, type VerifyAccountFormValues } from '@/lib/auth/schemas';
import { toastFormErrors } from '@/lib/auth/toastFormErrors';
import { showError, showSuccess } from '@/lib/utils/toast';

function VerifyAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const pendingEmail = useAppSelector((state) => state.auth.pendingEmail);
  const emailFromQuery = searchParams.get('email') || pendingEmail || '';

  const form = useForm<VerifyAccountFormValues>({
    resolver: zodResolver(verifyAccountSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: '',
    },
  });

  useEffect(() => {
    dispatch(clearAuthError());
    router.prefetch('/');
    if (emailFromQuery) {
      form.setValue('email', emailFromQuery);
    }
  }, [dispatch, emailFromQuery, form, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleResend = async () => {
    const email = form.getValues('email').trim().toLowerCase();
    if (!email) {
      showError('Enter your email first');
      return false;
    }
    const result = await dispatch(resendOtpUser({ email, purpose: 'verify' }));
    if (resendOtpUser.fulfilled.match(result)) {
      showSuccess('OTP resent. Check your email');
      form.setValue('otp', '');
      return true;
    }
    showError((result.payload as string) || 'Failed to resend OTP');
    return false;
  };

  const handleVerify = form.handleSubmit(
    async ({ email, otp }) => {
      const result = await dispatch(
        verifyOtpUser({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      );

      if (verifyOtpUser.fulfilled.match(result)) {
        showSuccess('Account verified');
        router.replace('/');
      } else {
        showError((result.payload as string) || 'OTP verification failed');
      }
    },
    toastFormErrors,
  );

  return (
      <AuthCard
        icon={<ShieldCheck className="size-5" />}
        title="Verify your account"
        subtitle="Enter the 6-digit OTP we sent after signup. Then you can open your workspace."
      >
        <form onSubmit={handleVerify} className="space-y-5" noValidate>
          {/* <AuthOutlinedInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.watch('email')}
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          /> */}
          <AuthOtpField
            value={form.watch('otp')}
            onChange={(value) => form.setValue('otp', value, { shouldValidate: true })}
            error={form.formState.errors.otp?.message}
            hint="Enter the 6-digit code emailed to you"
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify account'}
          </Button>
          <AuthResendButton onResend={handleResend} disabled={loading} />
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Wrong email?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Back to signup
          </Link>
        </p>
      </AuthCard>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<PagePending />}>
      <VerifyAccountForm />
    </Suspense>
  );
}
