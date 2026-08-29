'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link2 } from 'lucide-react';
import { AppShell, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { ConnectFacebookButton } from '@/components/agency/connect-facebook-button';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  CHANNEL_LABELS,
  getMetaStatus,
  listTenants,
  setupMetaApp,
  syncMetaConnection,
  type MetaStatus,
  type Tenant,
} from '@/lib/api/agencyApi';
import { useAppSelector } from '@/lib/store/hooks';
import { isAgencyAdmin } from '@/lib/auth/roles';
import { showError, showSuccess } from '@/lib/utils/toast';

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<AppShell><p className="text-sm text-slate-500">Loading Facebook connection...</p></AppShell>}>
      <ConnectionsContent />
    </Suspense>
  );
}

function ConnectionsContent() {
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const agency = isAgencyAdmin(user?.role);
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState<string>(user?.tenantId ? String(user.tenantId) : '');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [appIdInput, setAppIdInput] = useState('');
  const [appSecretInput, setAppSecretInput] = useState('');
  const [configIdInput, setConfigIdInput] = useState('');
  const [savingApp, setSavingApp] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState('');

  async function load() {
    try {
      const meta = await getMetaStatus();
      setStatus(meta);
      if (meta.tenantId) {
        setTenantId(String(meta.tenantId));
      }
      const whatsapp = meta.assets.find((asset) => asset.channelType === 'whatsapp');
      if (whatsapp) {
        setPhoneNumberId(whatsapp.externalId);
      }
      if (agency) {
        const clients = await listTenants();
        setTenants(clients.tenants);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load Facebook connection');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [agency]);

  useEffect(() => {
    const result = searchParams.get('meta');
    if (result === 'connected') {
      const fetchedId = searchParams.get('phoneNumberId') || '';
      if (fetchedId) {
        setPhoneNumberId(fetchedId);
      }
      showSuccess(
        fetchedId
          ? `Facebook login done. Phone Number ID ${fetchedId} was fetched and saved.`
          : 'Facebook connected. No WhatsApp number was found on that account.',
      );
      void load();
    } else if (result === 'error') {
      showError(searchParams.get('message') || 'Facebook login failed');
    }
  }, [searchParams]);

  const selectedTenant = tenantId ? Number(tenantId) : user?.tenantId || undefined;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Facebook Login for Business"
        title="Connect your ads account"
        subtitle="Log in with the Facebook you used to run ads. We fetch the WhatsApp Phone Number ID for you. You do not need to remember any IDs."
        action={
          status?.configured ? (
            <ConnectFacebookButton
              tenantId={selectedTenant}
              returnTo="/connections"
              label="Connect to Facebook"
            />
          ) : null
        }
      />

      {agency ? (
        <Surface className="mb-6 p-5">
          <Label>Save fetched IDs to this client</Label>
          <div className="mt-2 max-w-md">
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger>
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
          </div>
        </Surface>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Checking Facebook connection...</p>
      ) : !status?.appId ? (
        <Surface className="mx-auto max-w-lg p-6">
          <p className="text-base font-semibold text-slate-900">Turn on Continue with Facebook</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Facebook will not open a login popup until this app has a Meta App ID. Paste it once. After that, every user only clicks Continue with Facebook and signs in.
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setSavingApp(true);
              try {
                const result = await setupMetaApp({
                  appId: appIdInput.trim(),
                  appSecret: appSecretInput.trim(),
                  configId: configIdInput.trim() || undefined,
                });
                showSuccess(result.message);
                await load();
              } catch (error) {
                showError(error instanceof Error ? error.message : 'Could not save Facebook app');
              } finally {
                setSavingApp(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="fbAppId">App ID</Label>
              <Input id="fbAppId" required value={appIdInput} onChange={(event) => setAppIdInput(event.target.value)} placeholder="123456789012345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fbAppSecret">App Secret</Label>
              <Input id="fbAppSecret" required type="password" value={appSecretInput} onChange={(event) => setAppSecretInput(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fbConfigId">Config ID (optional)</Label>
              <Input id="fbConfigId" value={configIdInput} onChange={(event) => setConfigIdInput(event.target.value)} placeholder="Login for Business configuration" />
            </div>
            <Button type="submit" className="w-full bg-[#1877F2] hover:bg-[#166fe5]" disabled={savingApp}>
              {savingApp ? 'Saving...' : 'Save and show Facebook login'}
            </Button>
          </form>
        </Surface>
      ) : (
        <div className="space-y-4">
          <Surface className="p-6">
            <Label htmlFor="fetchedPhoneNumberId">Phone Number ID</Label>
            <Input
              id="fetchedPhoneNumberId"
              className="mt-2 font-mono"
              readOnly
              value={phoneNumberId}
              placeholder="This fills automatically after Facebook login"
            />
            <p className="mt-2 text-sm text-slate-500">
              Click Connect to Facebook, sign in, then this field is filled and saved for you.
            </p>
          </Surface>

          {status.facebookName ? (
            <Surface className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{status.facebookName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {status.companyName ? `Saved to ${status.companyName}` : 'Saved to your workspace'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={syncing}
                  onClick={async () => {
                    setSyncing(true);
                    try {
                      const result = await syncMetaConnection(selectedTenant);
                      showSuccess(result.message);
                      await load();
                    } catch (error) {
                      showError(error instanceof Error ? error.message : 'Sync failed');
                    } finally {
                      setSyncing(false);
                    }
                  }}
                >
                  {syncing ? 'Refreshing...' : 'Refresh IDs'}
                </Button>
              </div>
            </Surface>
          ) : null}

          {status.assets.map((asset) => (
            <Surface key={asset.id} className="p-4">
              <div className="flex items-center gap-3">
                <ChannelMark channelType={asset.channelType} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{asset.displayName}</p>
                  <p className="truncate font-mono text-xs text-slate-400">{asset.externalId}</p>
                </div>
                <Badge variant="secondary">{CHANNEL_LABELS[asset.channelType] || asset.channelType}</Badge>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </AppShell>
  );
}
