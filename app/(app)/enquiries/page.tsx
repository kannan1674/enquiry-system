'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Inbox, RefreshCw } from 'lucide-react';
import { EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { PagePending } from '@/components/common/page-pending';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CHANNEL_LABELS,
  syncEnquiries,
  type Enquiry,
  type EnquiryStatusOption,
} from '@/lib/api/agencyApi';
import { useAppSelector } from '@/lib/store/hooks';
import { isAgencyAdmin } from '@/lib/auth/roles';
import { apiRequest } from '@/lib/api/client';
import { showError, showSuccess } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

async function enquiryApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  return apiRequest<T>(path, {
    method: (init.method as 'GET' | 'POST' | 'PATCH') || 'GET',
    body: init.body ? JSON.parse(String(init.body)) : undefined,
  });
}

function sameEnquiryList(current: Enquiry[], next: Enquiry[]) {
  if (current.length !== next.length) {
    return false;
  }
  return current.every((item, index) => {
    const other = next[index];
    return item.id === other.id && item.status === other.status && item.message === other.message;
  });
}

function statusLabel(status: string, options: EnquiryStatusOption[]) {
  return options.find((option) => option.value === status)?.label || status;
}

const EnquiryRow = memo(function EnquiryRow({
  item,
  statuses,
  canEditStatus,
  onStatusChange,
}: {
  item: Enquiry;
  statuses: EnquiryStatusOption[];
  canEditStatus: boolean;
  onStatusChange: (enquiry: Enquiry, status: string) => void;
}) {
  return (
    <Surface className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ChannelMark channelType={item.channelType} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{item.contactName || 'Unknown contact'}</p>
            <p className="mt-1 text-sm text-slate-600">{item.contactPhone || 'No number'}</p>
            <p className="mt-3 text-sm leading-6 text-slate-800">{item.message || 'No message text'}</p>
            <p className="mt-3 text-xs text-slate-400">
              {item.companyName || 'Unassigned client'}
              {item.stageName ? ` · ${item.stageName}` : ''}
              {item.assetName ? ` · ${item.assetName}` : ''}
              {' · '}
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{CHANNEL_LABELS[item.channelType] || item.channelType}</Badge>
          {canEditStatus && statuses.length > 0 ? (
            <Select value={item.status} onValueChange={(value) => onStatusChange(item, value)}>
              <SelectTrigger className="h-8 w-[150px] rounded-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
                {!statuses.some((status) => status.value === item.status) ? (
                  <SelectItem value={item.status}>{item.status}</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          ) : (
            <Badge
              variant={item.status === 'open' ? 'default' : 'outline'}
              className={cn(item.status === 'contacted' && 'border-emerald-200 bg-emerald-50 text-emerald-700')}
            >
              {statusLabel(item.status, statuses)}
            </Badge>
          )}
        </div>
      </div>
    </Surface>
  );
});

export default function EnquiriesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const agency = isAgencyAdmin(user?.role);
  const [items, setItems] = useState<Enquiry[]>([]);
  const [statuses, setStatuses] = useState<EnquiryStatusOption[]>([]);
  const [canEditStatus, setCanEditStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const loadList = useCallback(async (quiet = false) => {
    try {
      const data = await enquiryApi<{ enquiries: Enquiry[] }>('/enquiries');
      setItems((current) => (sameEnquiryList(current, data.enquiries) ? current : data.enquiries));
    } catch (error) {
      if (!quiet) {
        throw error;
      }
    }
  }, []);

  const pullMessages = useCallback(
    async (silent = false) => {
      if (syncingRef.current) {
        return;
      }
      syncingRef.current = true;
      if (!silent) {
        setSyncing(true);
      }
      try {
        const result = await syncEnquiries();
        await loadList();
        if (!silent) {
          if (result.quarantined > 0) {
            showError(result.message);
          } else {
            showSuccess(result.message);
          }
        }
      } catch (error) {
        if (!silent) {
          showError(error instanceof Error ? error.message : 'Failed to pull WhatsApp messages');
        }
      } finally {
        syncingRef.current = false;
        if (!silent) {
          setSyncing(false);
        }
      }
    },
    [loadList],
  );

  const changeStatus = useCallback(
    (enquiry: Enquiry, status: string) => {
      if (status === enquiry.status) {
        return;
      }
      const previous = enquiry.status;
      setItems((current) => current.map((item) => (item.id === enquiry.id ? { ...item, status } : item)));
      showSuccess(`Status updated to ${statusLabel(status, statuses)}`);

      void enquiryApi(`/enquiries/${enquiry.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }).catch((error) => {
        setItems((current) => current.map((item) => (item.id === enquiry.id ? { ...item, status: previous } : item)));
        showError(error instanceof Error ? error.message : 'Could not change status');
      });
    },
    [statuses],
  );

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [enquiryData, statusData] = await Promise.all([
          enquiryApi<{ enquiries: Enquiry[] }>('/enquiries'),
          enquiryApi<{ statuses: EnquiryStatusOption[]; canEditStatus?: boolean }>('/enquiries/statuses'),
        ]);
        if (cancelled) {
          return;
        }
        setItems(enquiryData.enquiries);
        setStatuses(statusData.statuses || []);
        setCanEditStatus(Boolean(statusData.canEditStatus));
      } catch (error) {
        if (!cancelled) {
          showError(error instanceof Error ? error.message : 'Failed to load enquiries');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      return;
    }

    const tick = () => {
      if (document.visibilityState === 'visible') {
        void loadList(true);
      }
    };
    const interval = window.setInterval(tick, 2000);
    const syncInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void pullMessages(true);
      }
    }, 5000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      window.clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [hydrated, isAuthenticated, loadList, pullMessages]);

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Enquiries"
        subtitle="New WhatsApp messages appear here within a second. They attach to a client only when that Phone Number ID is mapped."
        action={
          <Button className="gap-2" onClick={() => void pullMessages(false)} disabled={syncing}>
            <RefreshCw className={syncing ? 'size-4 animate-spin' : 'size-4'} />
            {syncing ? 'Pulling...' : 'Pull WhatsApp'}
          </Button>
        }
      />

      {loading && items.length === 0 ? (
        <PagePending />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title="No enquiries yet"
          text="Connect Facebook or map your WhatsApp Phone Number ID, then pull messages."
          action={
            <Button variant="outline" asChild>
              <Link href={agency ? '/agency/clients' : '/connections'}>Connect channels</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <EnquiryRow
              key={item.id}
              item={item}
              statuses={statuses}
              canEditStatus={canEditStatus}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      )}
    </>
  );
}
