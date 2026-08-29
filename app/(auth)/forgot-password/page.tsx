'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCard } from '../components/auth-card';
import { AuthOutlinedInput } from '../components/auth-outlined-input';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { forgotPasswordUser } from '@/lib/api/authActions';
import { clearAuthError } from '@/lib/store/features/authSlice';
import { emailSchema, type EmailFormValues } from '@/lib/auth/schemas';
import { toastFormErrors } from '@/lib/auth/toastFormErrors';
import { showError, showSuccess } from '@/lib/utils/toast';
import { ScreenLoader } from '@/components/common/screen-loader';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = form.handleSubmit(
    async ({ email }) => {
      const normalized = email.trim().toLowerCase();
      const result = await dispatch(forgotPasswordUser({ email: normalized }));
      if (forgotPasswordUser.fulfilled.match(result)) {
        showSuccess('Reset OTP sent to your email');
        router.push(`/reset-password?email=${encodeURIComponent(normalized)}`);
      } else {
        showError((result.payload as string) || 'Unable to send reset OTP');
      }
    },
    toastFormErrors,
  );

  return (
    <>
    {loading ? <ScreenLoader message="Sending reset OTP..." /> : null}
    <AuthCard
      icon={<LifeBuoy className="size-5" />}
      title="Forgot password"
      subtitle="Enter your email and we will send an OTP to reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthOutlinedInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.watch('email')}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset OTP'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
    </>
  );
}
