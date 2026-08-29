'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarClock, IndianRupee, Megaphone, MessageCircleHeart, Users } from 'lucide-react';
import { AppShell, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { ScreenLoader } from '@/components/common/screen-loader';
import { Button } from '@/components/ui/button';
import { getAdInsight, type AdInsight } from '@/lib/api/agencyApi';
import {
  adStatusTone,
  costPerEnquiry,
  formatCount,
  formatMoney,
  formatPrettyDate,
} from '@/lib/ads/format';
import { useAppSelector } from '@/lib/store/hooks';
import { showError } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

export default function AdDetailPage() {
  return (
    <Suspense fallback={<AppShell><ScreenLoader message="Loading ad..." /></AppShell>}>
      <AdDetailContent />
    </Suspense>
  );
}

function AdDetailContent() {
  const params = useParams<{ adId: string }>();
  const searchParams = useSearchParams();
  const adId = decodeURIComponent(params.adId || '');
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const tenantId = searchParams.get('tenantId');
  const { hydrated, isAuthenticated } = useAppSelector((state) => state.auth);
  const [ad, setAd] = useState<AdInsight | null>(null);
  const [meta, setMeta] = useState<{ startDate?: string; endDate?: string; timezone?: string }>({});
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState('');

  const backHref = `/dashboard${startDate || endDate || tenantId ? '?' : ''}${new URLSearchParams({
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(tenantId ? { tenantId } : {}),
  }).toString()}`;

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMissing('');
    getAdInsight(adId, {
      startDate,
      endDate,
      tenantId: tenantId ? Number(tenantId) : undefined,
    })
      .then((data) => {
        if (!cancelled) {
          setAd(data.ad);
          setMeta({ startDate: data.startDate, endDate: data.endDate, timezone: data.timezone });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAd(null);
          const message = error instanceof Error ? error.message : 'Could not load this ad';
          setMissing(message);
          showError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, adId, startDate, endDate, tenantId]);

  const currency = ad?.currency || 'INR';
  const cpe = costPerEnquiry(ad?.amount, ad?.queryCount);

  return (
    <AppShell>
      <Button variant="outline" size="sm" className="mb-5 gap-2" asChild>
        <Link href={backHref || '/dashboard'}>
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>
      </Button>

      {loading ? (
        <ScreenLoader message="Fetching this ad..." />
      ) : !ad ? (
        <EmptyState
          icon={<Megaphone className="size-6" />}
          title="This ad is quiet"
          text={missing || 'No queries found for this ad in the selected dates'}
          action={
            <Button asChild>
              <Link href="/dashboard">Choose another date range</Link>
            </Button>
          }
        />
      ) : (
        <>
          <PageHeader
            eyebrow={ad.campaignName || 'Campaign'}
            title={ad.adName}
            subtitle={`${formatPrettyDate(meta.startDate)} – ${formatPrettyDate(meta.endDate)} · ${meta.timezone || 'Asia/Kolkata'}`}
            action={
              <span className={cn('rounded-full px-3 py-1 text-xs font-semibold ring-1', adStatusTone(ad.status))}>
                {ad.status || 'UNKNOWN'}
              </span>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat icon={<MessageCircleHeart className="size-4" />} tone="bg-rose-50 text-rose-600" label="Queries" value={formatCount(ad.queryCount)} />
            <Stat icon={<Users className="size-4" />} tone="bg-indigo-50 text-indigo-600" label="Unique people" value={formatCount(ad.uniqueCustomers || 0)} />
            <Stat icon={<IndianRupee className="size-4" />} tone="bg-amber-50 text-amber-700" label="Run budget" value={formatMoney(ad.amount, currency)} />
            <Stat icon={<CalendarClock className="size-4" />} tone="bg-emerald-50 text-emerald-700" label="Cost per enquiry" value={cpe == null ? '—' : formatMoney(cpe, currency)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Surface className="p-6 lg:col-span-2">
              <p className="font-semibold text-slate-900">How this ad ran</p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Fact label="Ad ID" value={ad.adId} mono />
                <Fact label="Campaign" value={ad.campaignName || '—'} />
                <Fact label="Campaign ID" value={ad.campaignId || '—'} mono />
                <Fact label="Budget type" value={ad.amountType === 'daily' ? 'Daily budget' : ad.amountType || '—'} />
                <Fact label="Daily budget" value={formatMoney(ad.dailyBudget || 0, currency)} />
                <Fact label="Lifetime budget" value={formatMoney(ad.lifetimeBudget || 0, currency)} />
                <Fact label="First query" value={formatPrettyDate(ad.firstQueryAt)} />
                <Fact label="Last query" value={formatPrettyDate(ad.lastQueryAt)} />
              </dl>
            </Surface>
            <Surface className="bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_55%)] p-6">
              <p className="font-semibold text-slate-900">In plain words</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {ad.queryCount
                  ? `${ad.adName} brought ${formatCount(ad.queryCount)} WhatsApp ${ad.queryCount === 1 ? 'query' : 'queries'} from ${formatCount(ad.uniqueCustomers || ad.queryCount)} ${ad.uniqueCustomers === 1 ? 'person' : 'people'}. The run budget for this period is ${formatMoney(ad.amount, currency)}.`
                  : 'This ad has not received WhatsApp queries in the selected dates.'}
              </p>
            </Surface>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Stat({
  icon,
  tone,
  label,
  value,
}: {
  icon: ReactNode;
  tone: string;
  label: string;
  value: string;
}) {
  return (
    <Surface className="p-5">
      <div className={cn('mb-3 flex size-9 items-center justify-center rounded-xl', tone)}>{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </Surface>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={cn('mt-1 text-sm font-medium text-slate-900', mono && 'break-all font-mono text-xs')}>{value}</dd>
    </div>
  );
}
