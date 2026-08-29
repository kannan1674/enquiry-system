'use client';

import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  Home,
  Inbox,
  LayoutDashboard,
  Link2,
  LogOut,
  Radio,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/store/features/authSlice';
import { isAgencyAdmin, isDirectOwner, roleLabel } from '@/lib/auth/roles';
import { listQuarantine } from '@/lib/api/agencyApi';
import { ScreenLoader } from '@/components/common/screen-loader';
import { cn } from '@/lib/utils';

const BASE_LINKS = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/connections', label: 'Facebook', icon: Link2 },
] as const;

const DIRECT_LINK = { href: '/workspace', label: 'My channels', icon: Radio };
const CLIENTS_LINK = { href: '/agency/clients', label: 'Clients', icon: Building2 };
const QUARANTINE_LINK = { href: '/agency/quarantine', label: 'Quarantine', icon: ShieldAlert };

const NavItem = memo(function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
        active
          ? 'bg-indigo-50 font-medium text-indigo-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      )}
    >
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          {badge}
        </span>
      ) : null}
    </Link>
  );
});

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const agency = isAgencyAdmin(user?.role);
  const direct = isDirectOwner(user?.role);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/signin');
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      return;
    }
    router.prefetch('/dashboard');
    router.prefetch('/enquiries');
    router.prefetch('/connections');
    if (agency) {
      router.prefetch('/agency/clients');
      router.prefetch('/agency/quarantine');
    }
    if (direct) {
      router.prefetch('/workspace');
    }
  }, [agency, direct, hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!agency) {
      return;
    }
    listQuarantine('pending')
      .then((data) => setPending(data.items.length))
      .catch(() => setPending(0));
  }, [agency]);

  const handleSignOut = useCallback(() => {
    dispatch(logout());
    router.replace('/signin');
  }, [dispatch, router]);

  const links = useMemo(
    () => [
      ...BASE_LINKS,
      ...(direct ? [DIRECT_LINK] : []),
      ...(agency
        ? [
            CLIENTS_LINK,
            { ...QUARANTINE_LINK, badge: pending },
          ]
        : []),
    ],
    [agency, direct, pending],
  );

  if (!hydrated || !isAuthenticated || !user) {
    return <ScreenLoader message="Loading workspace..." />;
  }

  return (
    <div className="flex min-h-full w-full bg-[#f6f7fb]">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex">
        <div className="px-5 py-6">
          <Link href="/" prefetch className="block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">Agency CRM</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Enquiry System</p>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              badge={'badge' in link ? link.badge : undefined}
              active={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))}
            />
          ))}
        </nav>
        <div className="border-t border-slate-200/80 p-4">
          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-indigo-600">
              {roleLabel(user.role)}
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full gap-2" onClick={handleSignOut}>
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur lg:hidden">
          <Link href="/" prefetch className="font-semibold text-slate-900">
            Enquiry System
          </Link>
          <div className="flex gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} prefetch className="rounded-lg px-2 py-1 text-xs text-slate-600">
                {link.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="min-w-0 grow px-4 py-6 sm:px-8 sm:py-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const AgencyOnly = memo(function AgencyOnly({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (hydrated && isAuthenticated && !isAgencyAdmin(user?.role)) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, router, user?.role]);

  if (!hydrated || !isAuthenticated) {
    return <ScreenLoader message="Loading workspace..." />;
  }

  if (!isAgencyAdmin(user?.role)) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4" />
        Agency access only
      </div>
    );
  }

  return <>{children}</>;
});

export const PageHeader = memo(function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
});

export const Surface = memo(function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]', className)}>
      {children}
    </div>
  );
});

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <Surface className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        {icon || <Building2 className="size-6" />}
      </div>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Surface>
  );
});
