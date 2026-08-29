'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCard } from '../components/auth-card';
import { AuthOutlinedInput } from '../components/auth-outlined-input';
import { AuthPasswordInput } from '../components/auth-password-input';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { signupUser } from '@/lib/api/authActions';
import { clearAuthError } from '@/lib/store/features/authSlice';
import { signupSchema, type SignupFormValues } from '@/lib/auth/schemas';
import { toastFormErrors } from '@/lib/auth/toastFormErrors';
import { showError, showSuccess } from '@/lib/utils/toast';

export default function SignUpPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountKind: 'direct',
      companyName: '',
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    dispatch(clearAuthError());
    router.prefetch('/verify-account');
  }, [dispatch, router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSignup = signupForm.handleSubmit(
    async ({ accountKind, companyName, name, email, mobile, password, confirmPassword }) => {
      const result = await dispatch(
        signupUser({
          accountKind,
          companyName: companyName?.trim() || undefined,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile?.trim() || undefined,
          password,
          confirmPassword,
        }),
      );
      if (signupUser.fulfilled.match(result)) {
        showSuccess('OTP sent. Verify your account to continue.');
        router.replace(`/verify-account?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        showError((result.payload as string) || 'Signup failed');
      }
    },
    toastFormErrors,
  );

  return (
    <AuthCard
      icon={<UserPlus className="size-5" />}
      title="Create account"
      subtitle="Use it yourself, or as an agency managing clients."
    >
      <form onSubmit={handleSignup} className="space-y-3" noValidate>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: 'direct', title: 'I run my own ads', text: 'No agency' },
              { id: 'agency', title: 'I am an agency', text: 'Handle clients' },
            ] as const
          ).map((option) => {
            const selected = signupForm.watch('accountKind') === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => signupForm.setValue('accountKind', option.id)}
                className={`rounded-xl border px-3 py-2.5 text-left ${
                  selected ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{option.text}</p>
              </button>
            );
          })}
        </div>
        {signupForm.watch('accountKind') === 'direct' ? (
          <AuthOutlinedInput
            id="companyName"
            label="Business name"
            value={signupForm.watch('companyName')}
            error={signupForm.formState.errors.companyName?.message}
            {...signupForm.register('companyName')}
          />
        ) : null}
        <AuthOutlinedInput
          id="name"
          label="Full name"
          value={signupForm.watch('name')}
          error={signupForm.formState.errors.name?.message}
          {...signupForm.register('name')}
        />
        <AuthOutlinedInput
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={signupForm.watch('email')}
          error={signupForm.formState.errors.email?.message}
          {...signupForm.register('email')}
        />
        <AuthOutlinedInput
          id="mobile"
          label="Mobile"
          type="tel"
          inputMode="numeric"
          value={signupForm.watch('mobile')}
          error={signupForm.formState.errors.mobile?.message}
          hint={<p className="text-xs text-slate-500">Optional 10-digit number</p>}
          {...signupForm.register('mobile')}
        />
        <AuthPasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          showStrength
          value={signupForm.watch('password')}
          error={signupForm.formState.errors.password?.message}
          {...signupForm.register('password')}
        />
        <AuthPasswordInput
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={signupForm.watch('confirmPassword')}
          error={signupForm.formState.errors.confirmPassword?.message}
          {...signupForm.register('confirmPassword')}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
