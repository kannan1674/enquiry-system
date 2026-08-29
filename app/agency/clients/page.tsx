'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Search } from 'lucide-react';
import { AppShell, AgencyOnly, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { ScreenLoader } from '@/components/common/screen-loader';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTenant, listTenants, type Tenant } from '@/lib/api/agencyApi';
import { showError, showSuccess } from '@/lib/utils/toast';

function setupScore(tenant: Tenant) {
  const users = (tenant.usersCount || 0) + (tenant.pendingInvitesCount || 0) > 0;
  const pipeline = (tenant.stagesCount || 0) > 0;
  const channels = (tenant.assetsCount || 0) > 0;
  return [users, pipeline, channels].filter(Boolean).length;
}

export default function ClientsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await listTenants();
      setTenants(data.tenants);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return tenants;
    }
    return tenants.filter(
      (tenant) =>
        tenant.companyName.toLowerCase().includes(value) || tenant.clientCode.toLowerCase().includes(value),
    );
  }, [query, tenants]);

  return (
    <AppShell>
      <AgencyOnly>
        <PageHeader
          eyebrow="Setup"
          title="Clients"
          subtitle="Create a company, then walk through users, pipeline, and channel mapping. Unmapped IDs stay quarantined."
          action={
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              New client
            </Button>
          }
        />

        <div className="relative mb-6 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search company or client code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {loading ? (
          <ScreenLoader message="Loading clients..." />
        ) : tenants.length === 0 ? (
          <EmptyState
            title="No clients yet"
            text="Add the first company to start agency setup. Channel assets remain unassigned until you map them."
            action={
              <Button className="gap-2" onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                Create first client
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState title="No matches" text="Try another company name or client code." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((tenant) => {
              const score = setupScore(tenant);
              return (
                <Link key={tenant.id} href={`/agency/clients/${tenant.id}`} className="group">
                  <Surface className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-indigo-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{tenant.companyName}</p>
                        <p className="mt-1 font-mono text-xs text-slate-400">{tenant.clientCode}</p>
                      </div>
                      <Badge variant="secondary">{tenant.status}</Badge>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                      <span>{tenant.usersCount || 0} users</span>
                      <span>{tenant.pendingInvitesCount || 0} invites</span>
                      <span>{tenant.assetsCount || 0} assets</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {(tenant.mappedChannels || []).length > 0 ? (
                          tenant.mappedChannels?.map((channel) => (
                            <ChannelMark key={channel} channelType={channel} size="sm" />
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">No channels mapped</span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                        {score}/3 ready
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Surface>
                </Link>
              );
            })}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create client tenant</DialogTitle>
              <DialogDescription>This company becomes its own isolated workspace.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSaving(true);
                  try {
                    const result = await createTenant({ companyName: companyName.trim() });
                    showSuccess(result.message);
                    setOpen(false);
                    setCompanyName('');
                    router.push(`/agency/clients/${result.tenant.id}`);
                  } catch (error) {
                    showError(error instanceof Error ? error.message : 'Failed to create client');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Acme Pvt Ltd"
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving || !companyName.trim()}>
                  {saving ? 'Creating...' : 'Create and open setup'}
                </Button>
              </form>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </AgencyOnly>
    </AppShell>
  );
}
