import { format, parseISO, startOfMonth, subDays } from 'date-fns';

export function isoDate(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function monthStartIso(date = new Date()) {
  return isoDate(startOfMonth(date));
}

export function daysAgoIso(days: number) {
  return isoDate(subDays(new Date(), days));
}

export function formatMoney(amount = 0, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${currency} ${Math.round(amount || 0).toLocaleString('en-IN')}`;
  }
}

export function formatCount(value = 0) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export function formatPrettyDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  try {
    return format(parseISO(value), value.includes('T') ? 'd MMM yyyy, h:mm a' : 'd MMM yyyy');
  } catch {
    return value;
  }
}

export function costPerEnquiry(amount = 0, queries = 0) {
  if (!queries) {
    return null;
  }
  return amount / queries;
}

export function adStatusTone(status?: string) {
  const value = (status || '').toUpperCase();
  if (value === 'ACTIVE') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  }
  if (value === 'PAUSED') {
    return 'bg-amber-50 text-amber-700 ring-amber-100';
  }
  if (value === 'DELETED' || value === 'ARCHIVED') {
    return 'bg-rose-50 text-rose-700 ring-rose-100';
  }
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}
