import { getAdsReport, listTenants } from '@/lib/api/agencyApi';
import { isoDate, monthStartIso } from '@/lib/ads/format';

export function defaultAdsRange() {
  return { startDate: monthStartIso(), endDate: isoDate() };
}

export function prefetchDashboardData(agency: boolean) {
  const jobs: Promise<unknown>[] = [getAdsReport(defaultAdsRange())];
  if (agency) {
    jobs.push(listTenants());
  }
  return Promise.all(jobs).catch(() => undefined);
}
