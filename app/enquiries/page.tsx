'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox, RefreshCw } from 'lucide-react';
import { AppShell, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CHANNEL_LABELS,
  listEnquiries,
  syncEnquiries,
  type Enquiry,
} from '@/lib/api/agencyApi';
import { useAppSelector } from '@/lib/store/hooks';
import { isAgencyAdmin } from '@/lib/auth/roles';
import { showError, showSuccess } from '@/lib/utils/toast';

export default function EnquiriesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const agency = isAgencyAdmin(user?.role);
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    try {
      const data = await listEnquiries();
      setItems(data.enquiries);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    void (async () => {
      setSyncing(true);
      try {
        await syncEnquiries();
      } catch {
        // Still show whatever is already stored.
      } finally {
        setSyncing(false);
      }
      await load();
    })();
  }, []);

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
        <p className="text-sm text-slate-500">Loading enquiries...</p>
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
                  <Badge variant={item.status === 'open' ? 'default' : 'outline'}>{item.status}</Badge>
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </AppShell>
  );
}
