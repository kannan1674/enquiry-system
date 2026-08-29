'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio } from 'lucide-react';
import { AppShell, EmptyState, PageHeader } from '@/components/app-shell';
import { ScreenLoader } from '@/components/common/screen-loader';
import { FacebookBusinessLogin } from '@/components/agency/facebook-business-login';
import { ChannelAssetRow } from '@/components/agency/channel-asset-row';
import { Button } from '@/components/ui/button';
import {
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
  const user = useAppSelector((state) => state.auth.user);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [assets, setAssets] = useState<ChannelAsset[]>([]);
  const [metaReady, setMetaReady] = useState(false);
  const [metaAppId, setMetaAppId] = useState<string | null>(null);
  const [metaConfigId, setMetaConfigId] = useState<string | null>(null);
  const [graphVersion, setGraphVersion] = useState('v21.0');
  const [loading, setLoading] = useState(true);

  const reloadAssets = useCallback(() => {
    if (!user?.tenantId) {
      return;
    }
    listAssets(user.tenantId)
      .then((data) => setAssets(data.assets))
      .catch((error) => showError(error instanceof Error ? error.message : 'Failed to reload'));
  }, [user?.tenantId]);

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
              onConnected={reloadAssets}
            />
          ) : null
        }
      />

      {loading ? (
        <ScreenLoader message="Loading workspace..." />
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
            <ChannelAssetRow key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
