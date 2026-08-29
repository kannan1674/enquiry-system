import { getAdsReport, listTenants } from '@/lib/api/agencyApi';
import { isoDate, monthStartIso } from '@/lib/ads/format';

export function defaultAdsRange() {
  return { startDate: monthStartIso(), endDate: isoDate() };
}

export function prefetchDashboardData(options: { agency: boolean; tenantId?: number | null; userId?: number }) {
  const jobs: Promise<unknown>[] = [
    getAdsReport({
      ...defaultAdsRange(),
      tenantId: options.tenantId || undefined,
      userId: options.userId,
    }),
  ];
  if (options.agency) {
    jobs.push(listTenants());
  }
  return Promise.all(jobs).catch(() => undefined);
}
