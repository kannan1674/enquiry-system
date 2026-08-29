'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { AppShell, AgencyOnly, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CHANNEL_LABELS,
  dismissQuarantine,
  listQuarantine,
  listTenants,
  mapQuarantine,
  type QuarantineItem,
  type Tenant,
} from '@/lib/api/agencyApi';
import { showError, showSuccess } from '@/lib/utils/toast';

export default function QuarantinePage() {
  const [items, setItems] = useState<QuarantineItem[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantByItem, setTenantByItem] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    try {
      const [quarantine, clientList] = await Promise.all([listQuarantine('pending'), listTenants()]);
      setItems(quarantine.items);
      setTenants(clientList.tenants);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load quarantine');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <AppShell>
      <AgencyOnly>
        <PageHeader
          eyebrow="Safety net"
          title="Quarantine"
          subtitle="Unknown Facebook Pages, Instagram accounts, lead forms, and WhatsApp numbers wait here. They are never guessed onto a client."
        />

        {items.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="size-6" />}
            title="All clear"
            text="Mapped IDs route to their client. Anything else will appear here for a manual decision."
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Surface key={item.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <ChannelMark channelType={item.channelType} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {CHANNEL_LABELS[item.channelType] || item.channelType}
                      </p>
                      <p className="mt-1 font-mono text-sm text-slate-600">{item.externalAssetId}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Received {new Date(item.receivedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={tenantByItem[item.id]}
                      onValueChange={(value) => setTenantByItem((current) => ({ ...current, [item.id]: value }))}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Choose a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={String(tenant.id)}>
                            {tenant.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!tenantByItem[item.id] || busyId === item.id}
                      onClick={async () => {
                        setBusyId(item.id);
                        try {
                          await mapQuarantine(item.id, { tenantId: Number(tenantByItem[item.id]) });
                          showSuccess('Mapped to that client only');
                          await load();
                        } catch (error) {
                          showError(error instanceof Error ? error.message : 'Map failed');
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      Map to client
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === item.id}
                      onClick={async () => {
                        setBusyId(item.id);
                        try {
                          await dismissQuarantine(item.id);
                          showSuccess('Dismissed');
                          await load();
                        } catch (error) {
                          showError(error instanceof Error ? error.message : 'Dismiss failed');
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Surface>
            ))}
          </div>
        )}
      </AgencyOnly>
    </AppShell>
  );
}
