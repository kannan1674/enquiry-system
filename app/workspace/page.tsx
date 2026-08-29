'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio } from 'lucide-react';
import { AppShell, EmptyState, PageHeader, Surface } from '@/components/app-shell';
import { FacebookBusinessLogin } from '@/components/agency/facebook-business-login';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CHANNEL_LABELS,
  getMetaStatus,
  getTenant,
  listAssets,
  type ChannelAsset,
  type Tenant,
} from '@/lib/api/agencyApi';
import { useAppSelector } from '@/lib/store/hooks';
import { isDirectOwner } from '@/lib/auth/roles';
import { showError } from '@/lib/utils/toast';

export default function WorkspacePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [assets, setAssets] = useState<ChannelAsset[]>([]);
  const [metaReady, setMetaReady] = useState(false);
  const [metaAppId, setMetaAppId] = useState<string | null>(null);
  const [metaConfigId, setMetaConfigId] = useState<string | null>(null);
  const [graphVersion, setGraphVersion] = useState('v21.0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenantId) {
      setLoading(false);
      return;
    }
    Promise.all([getTenant(user.tenantId), listAssets(user.tenantId), getMetaStatus().catch(() => null)])
      .then(([tenantRes, assetsRes, meta]) => {
        setTenant(tenantRes.tenant);
        setAssets(assetsRes.assets);
        setMetaReady(Boolean(meta?.configured));
        setMetaAppId(meta?.appId || null);
        setMetaConfigId(meta?.configId || null);
        setGraphVersion(meta?.graphVersion || 'v21.0');
      })
      .catch((error) => {
        showError(error instanceof Error ? error.message : 'Failed to load workspace');
      })
      .finally(() => setLoading(false));
  }, [user?.tenantId]);

  if (!isDirectOwner(user?.role)) {
    return (
      <AppShell>
        <EmptyState
          title="Agency workspace"
          text="Agencies manage clients from the Clients page. Direct business owners use this screen."
          action={
            <Button asChild>
              <Link href="/agency/clients">Open clients</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Your business"
        title={tenant?.companyName || 'My workspace'}
        subtitle="Log in with the Facebook account you used to run ads. We fetch your WhatsApp Phone Number ID automatically. You do not need to remember it."
        action={
          user?.tenantId && metaAppId ? (
            <FacebookBusinessLogin
              tenantId={user.tenantId}
              appId={metaAppId}
              configId={metaConfigId}
              graphVersion={graphVersion}
              onConnected={() => {
                if (!user.tenantId) {
                  return;
                }
                listAssets(user.tenantId)
                  .then((data) => setAssets(data.assets))
                  .catch((error) => showError(error instanceof Error ? error.message : 'Failed to reload'));
              }}
            />
          ) : null
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading workspace...</p>
      ) : (
        <div className="space-y-4">
          {!metaAppId ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Continue with Facebook will appear here after the product owner adds one Meta App ID. Fresh users then only log in with Facebook.
            </p>
          ) : null}
          {assets.length === 0 && metaReady ? (
            <EmptyState
              icon={<Radio className="size-6" />}
              title="No channels yet"
              text="Connect Facebook Business. We will fetch your WhatsApp number ID automatically."
            />
          ) : null}
          {assets.map((asset) => (
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
