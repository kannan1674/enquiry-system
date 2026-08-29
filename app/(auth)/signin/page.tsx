'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCard } from '../components/auth-card';
import { AuthOutlinedInput } from '../components/auth-outlined-input';
import { AuthPasswordInput } from '../components/auth-password-input';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { signinUser } from '@/lib/api/authActions';
import { clearAuthError } from '@/lib/store/features/authSlice';
import { signinSchema, type SigninFormValues } from '@/lib/auth/schemas';
import { toastFormErrors } from '@/lib/auth/toastFormErrors';
import { showError, showSuccess } from '@/lib/utils/toast';

export default function SignInPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    dispatch(clearAuthError());
    router.prefetch('/');
  }, [dispatch, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSignin = form.handleSubmit(
    async ({ email, password }) => {
      const result = await dispatch(
        signinUser({ email: email.trim().toLowerCase(), password }),
      );
      if (signinUser.fulfilled.match(result)) {
        showSuccess('Signed in');
        router.replace('/');
      } else {
        showError((result.payload as string) || 'Sign in failed');
      }
    },
    toastFormErrors,
  );

  return (
    <AuthCard
      icon={<KeyRound className="size-5" />}
      title="Welcome back"
      subtitle="Sign in with your email and password."
    >
      <form onSubmit={handleSignin} className="space-y-5" noValidate>
        <AuthOutlinedInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.watch('email')}
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <AuthPasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          value={form.watch('password')}
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-sm justify-end">
        <Link href="/forgot-password" className="font-medium text-primary hover:underline text-end">
          Forgot password?
        </Link>
        {/* <Link href="/verify-account" className="font-medium text-primary hover:underline">
          Verify your account
        </Link> */}
        <p className="text-muted-foreground">
          Not a member yet?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
