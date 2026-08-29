'use client';

import { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarRange,
  IndianRupee,
  LayoutDashboard,
  Megaphone,
  MessageCircleHeart,
  Sparkles,
  Users,
} from 'lucide-react';
import { AppShell, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { ScreenLoader } from '@/components/common/screen-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getAdsReport,
  listTenants,
  type AdInsight,
  type AdsReport,
  type Tenant,
} from '@/lib/api/agencyApi';
import {
  adStatusTone,
  costPerEnquiry,
  daysAgoIso,
  formatCount,
  formatMoney,
  formatPrettyDate,
  isoDate,
  monthStartIso,
} from '@/lib/ads/format';
import { useAppSelector } from '@/lib/store/hooks';
import { isAgencyAdmin } from '@/lib/auth/roles';
import { showError } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

const AdsChart = dynamic(() => import('@/components/dashboard/ads-chart').then((mod) => mod.AdsChart), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100" />,
});

const PRESETS = [
  { id: 'month', label: 'This month' },
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: 'Last 30 days' },
] as const;

const EMPTY_ADS: AdInsight[] = [];

const KpiCard = memo(function KpiCard({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  tone: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Surface className="p-5">
      <div className={cn('mb-3 flex size-9 items-center justify-center rounded-xl', tone)}>{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
    </Surface>
  );
});

const MiniStat = memo(function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
});

const AdCard = memo(function AdCard({
  ad,
  href,
  currency,
  maxQueries,
}: {
  ad: AdInsight;
  href: string;
  currency: string;
  maxQueries: number;
}) {
  const width = Math.max(8, Math.round(((ad.queryCount || 0) / maxQueries) * 100));

  return (
    <Link href={href} prefetch className="group">
      <Surface className="h-full p-5 transition-transform group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">{ad.adName}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{ad.campaignName || 'Untitled campaign'}</p>
          </div>
          <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1', adStatusTone(ad.status))}>
            {ad.status || 'UNKNOWN'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat label="Queries" value={formatCount(ad.queryCount)} />
          <MiniStat label="People" value={formatCount(ad.uniqueCustomers || 0)} />
          <MiniStat label="Budget" value={formatMoney(ad.amount, ad.currency || currency)} />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>Conversation share</span>
            <span>{ad.queryCount} queries</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#818cf8,#fb7185)]"
              style={{ width: `${width}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-indigo-600">
          <span className="truncate font-mono text-xs text-slate-400">{ad.adId}</span>
          <span className="inline-flex items-center gap-1 font-medium">
            View ad
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Surface>
    </Link>
  );
});

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const agency = isAgencyAdmin(user?.role);
  const [startDate, setStartDate] = useState(monthStartIso());
  const [endDate, setEndDate] = useState(isoDate());
  const [preset, setPreset] = useState<string>('month');
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [report, setReport] = useState<AdsReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      return;
    }

    let cancelled = false;
    if (!report) {
      setLoading(true);
    }

    const reportPromise = getAdsReport({
      startDate,
      endDate,
      tenantId: tenantId ? Number(tenantId) : undefined,
    });
    const tenantsPromise = agency && tenants.length === 0 ? listTenants() : null;

    Promise.all([reportPromise, tenantsPromise])
      .then(([data, clientList]) => {
        if (cancelled) {
          return;
        }
        setReport(data);
        if (clientList) {
          setTenants(clientList.tenants);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setReport(null);
          showError(error instanceof Error ? error.message : 'Could not load ads report');
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
  }, [hydrated, isAuthenticated, startDate, endDate, tenantId, agency]);

  const ads = report?.ads ?? EMPTY_ADS;
  const currency = report?.currency || 'INR';
  const cpe = costPerEnquiry(report?.totalAmount, report?.totalQueries);
  const chartData = useMemo(
    () =>
      ads.slice(0, 6).map((ad) => ({
        name: ad.adName.length > 16 ? `${ad.adName.slice(0, 16)}…` : ad.adName,
        queries: ad.queryCount || 0,
        spend: ad.amount || 0,
      })),
    [ads],
  );
  const maxQueries = useMemo(() => Math.max(...ads.map((ad) => ad.queryCount || 0), 1), [ads]);

  const applyPreset = useCallback((id: string) => {
    setPreset(id);
    setEndDate(isoDate());
    if (id === 'month') {
      setStartDate(monthStartIso());
    } else if (id === '7') {
      setStartDate(daysAgoIso(6));
    } else if (id === '30') {
      setStartDate(daysAgoIso(29));
    }
  }, []);

  const rangeLabel = report
    ? `${formatPrettyDate(report.startDate)} – ${formatPrettyDate(report.endDate)}`
    : `${formatPrettyDate(startDate)} – ${formatPrettyDate(endDate)}`;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Insights"
        title="Ad dashboard"
        subtitle="Clear numbers for every Meta ad: how many people enquired, what you spent, and which ads actually brought conversations."
      />

      <Surface className="mb-6 overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#eef2ff_0%,#fff7ed_52%,#ecfeff_100%)] px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                <Sparkles className="size-4" />
                A calm look at your ads
              </p>
              <p className="mt-1 text-sm text-slate-600">{rangeLabel}</p>
              <p className="mt-1 text-xs text-slate-500">{report?.timezone || 'Asia/Kolkata'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyPreset(item.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors',
                    preset === item.id
                      ? 'bg-indigo-600 text-white ring-indigo-600'
                      : 'bg-white/80 text-slate-600 ring-slate-200 hover:bg-white',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">From</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setPreset('custom');
                  setStartDate(event.target.value);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">To</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setPreset('custom');
                  setEndDate(event.target.value);
                }}
              />
            </div>
            {agency ? (
              <div className="space-y-1.5 md:col-span-2">
                <Label>Client</Label>
                <Select value={tenantId || 'all'} onValueChange={(value) => setTenantId(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All clients</SelectItem>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={String(tenant.id)}>
                        {tenant.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </div>
      </Surface>

      {loading ? (
        <ScreenLoader message="Fetching ads report..." />
      ) : !report || ads.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboard className="size-6" />}
          title="No ad insights yet"
          text="When Meta ads start bringing WhatsApp enquiries, they will appear here with spend and conversation counts."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<Megaphone className="size-4" />}
              tone="bg-indigo-50 text-indigo-600"
              label="Ads run"
              value={formatCount(report.adsRun)}
              hint="Ads that received at least one enquiry"
            />
            <KpiCard
              icon={<MessageCircleHeart className="size-4" />}
              tone="bg-rose-50 text-rose-600"
              label="WhatsApp queries"
              value={formatCount(report.totalQueries)}
              hint="All conversations in this range"
            />
            <KpiCard
              icon={<IndianRupee className="size-4" />}
              tone="bg-amber-50 text-amber-700"
              label="Spend"
              value={formatMoney(report.totalAmount, currency)}
              hint="Sum of each ad’s run budget"
            />
            <KpiCard
              icon={<Users className="size-4" />}
              tone="bg-emerald-50 text-emerald-700"
              label="Cost per enquiry"
              value={cpe == null ? '—' : formatMoney(cpe, currency)}
              hint={cpe == null ? 'Need at least one query' : 'Spend divided by queries'}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <Surface className="p-5 xl:col-span-3">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">Queries vs spend</p>
                  <p className="mt-1 text-sm text-slate-500">Top ads in this date range</p>
                </div>
                <CalendarRange className="size-4 text-slate-400" />
              </div>
              <div className="h-64">
                <AdsChart data={chartData} currency={currency} />
              </div>
            </Surface>

            <Surface className="p-5 xl:col-span-2">
              <p className="font-semibold text-slate-900">What this means</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>
                  <span className="font-medium text-slate-900">{formatCount(report.adsRun)} ads</span> ran and
                  received WhatsApp interest.
                </li>
                <li>
                  People sent{' '}
                  <span className="font-medium text-slate-900">{formatCount(report.totalQueries)} queries</span> in
                  this period.
                </li>
                <li>
                  You spent{' '}
                  <span className="font-medium text-slate-900">{formatMoney(report.totalAmount, currency)}</span> to
                  get those conversations.
                </li>
                <li>
                  Best next step: open the ad with the most queries and see if the budget is still working.
                </li>
              </ul>
            </Surface>
          </div>

          <div>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="font-semibold text-slate-900">Ads</p>
                <p className="text-sm text-slate-500">Tap an ad for the full picture</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {ads.map((ad) => (
                <AdCard
                  key={ad.adId}
                  ad={ad}
                  currency={currency}
                  maxQueries={maxQueries}
                  href={`/dashboard/${encodeURIComponent(ad.adId)}?startDate=${startDate}&endDate=${endDate}${
                    tenantId ? `&tenantId=${tenantId}` : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
