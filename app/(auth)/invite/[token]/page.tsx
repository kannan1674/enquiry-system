'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ScreenLoader } from '@/components/common/screen-loader';
import { AuthCard } from '@/app/(auth)/components/auth-card';
import { AuthOutlinedInput } from '@/app/(auth)/components/auth-outlined-input';
import { AuthPasswordInput } from '@/app/(auth)/components/auth-password-input';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { acceptInvite, getInvite } from '@/lib/api/agencyApi';
import { setAuthSession } from '@/lib/store/features/authSlice';
import { showError, showSuccess } from '@/lib/utils/toast';
import { roleLabel } from '@/lib/auth/roles';
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '@/lib/auth/password';

const acceptSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required'),
    mobile: z.string().trim().optional(),
    password: z.string().min(1, 'Password is required').refine(isStrongPassword, PASSWORD_RULE_MESSAGE),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type AcceptValues = z.infer<typeof acceptSchema>;

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');

  const acceptForm = useForm<AcceptValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: { name: '', mobile: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInvite(params.token);
        setEmail(data.invite.email);
        setCompanyName(data.invite.companyName);
        setRole(data.invite.role);
        if (data.invite.name) {
          acceptForm.setValue('name', data.invite.name);
        }
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Invite is invalid');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [acceptForm, params.token]);

  if (loading) {
    return <ScreenLoader message="Loading invite..." />;
  }

  return (
    <AuthCard
      icon={<UserPlus className="size-5" />}
      title={companyName ? `Join ${companyName}` : 'Accept invite'}
      subtitle={email ? `${email} · ${roleLabel(role)}` : 'This invite link is invalid or expired.'}
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={acceptForm.handleSubmit(async ({ name, mobile, password, confirmPassword }) => {
          setSubmitting(true);
          try {
            const result = await acceptInvite(params.token, {
              name,
              mobile: mobile || undefined,
              password,
              confirmPassword,
            });
            dispatch(setAuthSession({ token: result.token, user: result.user }));
            showSuccess('Account activated');
            router.replace('/');
          } catch (error) {
            showError(error instanceof Error ? error.message : 'Unable to accept invite');
          } finally {
            setSubmitting(false);
          }
        })}
      >
        <AuthOutlinedInput
          id="name"
          label="Full name"
          value={acceptForm.watch('name')}
          error={acceptForm.formState.errors.name?.message}
          {...acceptForm.register('name')}
        />
        <AuthOutlinedInput id="email" label="Email" type="email" value={email} readOnly />
        <AuthPasswordInput
          id="password"
          label="Password"
          showStrength
          value={acceptForm.watch('password')}
          error={acceptForm.formState.errors.password?.message}
          {...acceptForm.register('password')}
        />
        <AuthPasswordInput
          id="confirmPassword"
          label="Confirm password"
          value={acceptForm.watch('confirmPassword')}
          error={acceptForm.formState.errors.confirmPassword?.message}
          {...acceptForm.register('confirmPassword')}
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting || !email}>
          {submitting ? 'Accepting...' : 'Accept invite'}
        </Button>
      </form>
    </AuthCard>
  );
}
