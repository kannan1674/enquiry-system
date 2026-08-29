'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox, RefreshCw } from 'lucide-react';
import { AppShell, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { ScreenLoader } from '@/components/common/screen-loader';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CHANNEL_LABELS,
  listEnquiries,
  listEnquiryStatuses,
  syncEnquiries,
  updateEnquiryStatus,
  type Enquiry,
  type EnquiryStatusOption,
} from '@/lib/api/agencyApi';
import { useAppSelector } from '@/lib/store/hooks';
import { isAgencyAdmin } from '@/lib/auth/roles';
import { showError, showSuccess } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

function statusLabel(status: string, options: EnquiryStatusOption[]) {
  return options.find((option) => option.value === status)?.label || status;
}

export default function EnquiriesPage() {
  const { user, hydrated, isAuthenticated } = useAppSelector((state) => state.auth);
  const agency = isAgencyAdmin(user?.role);
  const [items, setItems] = useState<Enquiry[]>([]);
  const [statuses, setStatuses] = useState<EnquiryStatusOption[]>([]);
  const [canEditStatus, setCanEditStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    const data = await listEnquiries();
    setItems(data.enquiries);
  }

  async function pullMessages() {
    setSyncing(true);
    try {
      const result = await syncEnquiries();
      if (result.quarantined > 0) {
        showError(result.message);
      } else {
        showSuccess(result.message);
      }
      await load();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to pull WhatsApp messages');
    } finally {
      setSyncing(false);
    }
  }

  async function changeStatus(enquiry: Enquiry, status: string) {
    if (status === enquiry.status || savingId === enquiry.id) {
      return;
    }
    const previous = enquiry.status;
    setItems((current) => current.map((item) => (item.id === enquiry.id ? { ...item, status } : item)));
    setSavingId(enquiry.id);
    try {
      await updateEnquiryStatus(enquiry.id, status);
      showSuccess(`Status updated to ${statusLabel(status, statuses)}`);
    } catch (error) {
      setItems((current) => current.map((item) => (item.id === enquiry.id ? { ...item, status: previous } : item)));
      showError(error instanceof Error ? error.message : 'Could not change status');
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const [statusData, enquiryData] = await Promise.all([listEnquiryStatuses(), listEnquiries()]);
        setStatuses(statusData.statuses || []);
        setCanEditStatus(Boolean(statusData.canEditStatus));
        setItems(enquiryData.enquiries);
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Failed to load enquiries');
      } finally {
        setLoading(false);
      }

      setSyncing(true);
      try {
        await syncEnquiries();
        await load();
      } catch {
        // Keep the list already on screen.
      } finally {
        setSyncing(false);
      }
    })();
  }, [hydrated, isAuthenticated]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Inbox"
        title="Enquiries"
        subtitle="WhatsApp messages are pulled from the inbound API and attached to a client only when that Phone Number ID is mapped."
        action={
          <Button className="gap-2" onClick={() => void pullMessages()} disabled={syncing}>
            <RefreshCw className={syncing ? 'size-4 animate-spin' : 'size-4'} />
            {syncing ? 'Pulling...' : 'Pull WhatsApp'}
          </Button>
        }
      />

      {loading ? (
        <ScreenLoader message="Loading enquiries..." />
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
            <Surface key={item.id} className="p-5">
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
                    <Select
                      value={item.status}
                      onValueChange={(value) => void changeStatus(item, value)}
                      disabled={savingId === item.id}
                    >
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
          ))}
        </div>
      )}
    </AppShell>
  );
}
