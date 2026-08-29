'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, GitBranch, Radio, Users } from 'lucide-react';
import { AppShell, AgencyOnly, PageHeader, Surface } from '@/components/app-shell';
import { ScreenLoader } from '@/components/common/screen-loader';
import { ChannelMark } from '@/components/agency/channel-mark';
import { ChannelAssetRow, TenantUserRow } from '@/components/agency/channel-asset-row';
import { ConnectFacebookButton } from '@/components/agency/connect-facebook-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CHANNEL_LABELS,
  createAsset,
  createInvite,
  createStage,
  getTenant,
  listAssets,
  listInvites,
  listPipeline,
  listTenantUsers,
  upsertRouting,
  type ChannelAsset,
  type PipelineStage,
  type RoutingRule,
  type Tenant,
  type TenantUser,
  type UserInvite,
} from '@/lib/api/agencyApi';
import { roleLabel } from '@/lib/auth/roles';
import { showError, showSuccess } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'users', label: 'Users', hint: 'Invite the company', icon: Users },
  { id: 'pipeline', label: 'Pipeline', hint: 'Set routing', icon: GitBranch },
  { id: 'channels', label: 'Channels', hint: 'Map exact IDs', icon: Radio },
] as const;

const CHANNEL_TYPES = Object.keys(CHANNEL_LABELS);

type TabId = (typeof TABS)[number]['id'];

export default function ClientSetupPage() {
  return (
    <Suspense fallback={<AppShell><ScreenLoader message="Loading client setup..." /></AppShell>}>
      <ClientSetupContent />
    </Suspense>
  );
}

function ClientSetupContent() {
  const params = useParams<{ tenantId: string }>();
  const searchParams = useSearchParams();
  const tenantId = Number(params.tenantId);
  const [tab, setTab] = useState<TabId>('users');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [assets, setAssets] = useState<ChannelAsset[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('client_admin');
  const [stageName, setStageName] = useState('');
  const [assetType, setAssetType] = useState('facebook_page');
  const [assetId, setAssetId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!tenantId) {
      return;
    }
    try {
      const [tenantRes, usersRes, invitesRes, pipelineRes, assetsRes] = await Promise.all([
        getTenant(tenantId),
        listTenantUsers(tenantId),
        listInvites(tenantId),
        listPipeline(tenantId),
        listAssets(tenantId),
      ]);
      setTenant(tenantRes.tenant);
      setUsers(usersRes.users);
      setInvites(invitesRes.invites);
      setStages(pipelineRes.stages);
      setRules(pipelineRes.routingRules);
      setAssets(assetsRes.assets);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to load setup');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const result = searchParams.get('meta');
    if (result === 'connected') {
      showSuccess(`Facebook connected. Imported ${searchParams.get('whatsapp') || '0'} WhatsApp number(s).`);
      setTab('channels');
      void load();
    } else if (result === 'error') {
      showError(searchParams.get('message') || 'Facebook login failed');
    }
  }, [searchParams, load]);

  const defaultStage = useMemo(() => stages.find((stage) => stage.isDefault), [stages]);
  const pendingInvites = useMemo(() => invites.filter((invite) => !invite.acceptedAt), [invites]);
  const done = useMemo(
    () => ({
      users: users.length + pendingInvites.length > 0,
      pipeline: stages.length > 0,
      channels: assets.length > 0,
    }),
    [assets.length, pendingInvites.length, stages.length, users.length],
  );

  const saveRouting = useCallback(
    async (channelType: string, value: string) => {
      try {
        await upsertRouting(tenantId, {
          channelType,
          pipelineStageId: Number(value),
        });
        showSuccess('Routing saved');
        await load();
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Routing failed');
      }
    },
    [load, tenantId],
  );

  return (
    <AppShell>
      <AgencyOnly>
        {loading ? <ScreenLoader message="Loading client setup..." /> : null}
        <Link href="/agency/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4" />
          All clients
        </Link>
        <PageHeader
          eyebrow="Client setup"
          title={tenant?.companyName || 'Client setup'}
          subtitle="Invite users, set pipeline routing, then map this company's Facebook, Instagram, lead form, and WhatsApp IDs."
        />

        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {TABS.map((item, index) => {
            const Icon = item.icon;
            const complete = done[item.id];
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'rounded-2xl border px-4 py-4 text-left transition-all',
                  active
                    ? 'border-indigo-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.45)]'
                    : 'border-transparent bg-white/70 hover:bg-white',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-xs font-semibold',
                      complete ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700',
                    )}
                  >
                    {complete ? <Check className="size-4" /> : index + 1}
                  </span>
                  <Icon className="size-4 text-slate-400" />
                </div>
                <p className="mt-3 font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              </button>
            );
          })}
        </div>

        {tab === 'users' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Surface className="p-6">
              <p className="text-base font-semibold text-slate-900">Invite a company user</p>
              <p className="mt-1 text-sm text-slate-500">They join this client only. No access to other companies.</p>
              <form
                className="mt-5 space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSaving(true);
                  try {
                    const result = await createInvite(tenantId, {
                      name: inviteName.trim() || undefined,
                      email: inviteEmail.trim().toLowerCase(),
                      role: inviteRole,
                    });
                    showSuccess(result.message);
                    setInviteEmail('');
                    setInviteName('');
                    await load();
                  } catch (error) {
                    showError(error instanceof Error ? error.message : 'Invite failed');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="inviteName">Name</Label>
                  <Input id="inviteName" value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Priya Sharma" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Work email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="priya@acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client_admin">Client admin</SelectItem>
                      <SelectItem value="client_manager">Client manager</SelectItem>
                      <SelectItem value="client_executive">Client executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Sending invite...' : 'Send invite'}
                </Button>
              </form>
            </Surface>

            <Surface className="p-6">
              <p className="text-base font-semibold text-slate-900">People</p>
              <div className="mt-4 space-y-3">
                {users.map((user) => (
                  <TenantUserRow
                    key={user.id}
                    name={user.name}
                    detail={user.email}
                    role={roleLabel(user.role)}
                  />
                ))}
                {pendingInvites.map((invite) => (
                  <TenantUserRow
                    key={invite.id}
                    name={invite.email}
                    detail="Waiting to accept"
                    role={roleLabel(invite.role)}
                    pending
                  />
                ))}
                {users.length === 0 && pendingInvites.length === 0 ? (
                  <p className="text-sm text-slate-500">No one has been invited yet.</p>
                ) : null}
              </div>
            </Surface>
          </div>
        ) : null}

        {tab === 'pipeline' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Surface className="p-6">
              <p className="text-base font-semibold text-slate-900">Stages</p>
              <p className="mt-1 text-sm text-slate-500">New leads enter the default stage unless a channel rule says otherwise.</p>
              <div className="mt-4 space-y-2">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm">
                    <span className="flex items-center gap-3">
                      <span className="w-5 text-xs font-semibold text-slate-400">{index + 1}</span>
                      {stage.name}
                    </span>
                    {stage.isDefault ? <Badge>Default</Badge> : null}
                  </div>
                ))}
              </div>
              <form
                className="mt-4 flex gap-2"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!stageName.trim()) {
                    return;
                  }
                  try {
                    await createStage(tenantId, { name: stageName.trim() });
                    setStageName('');
                    showSuccess('Stage added');
                    await load();
                  } catch (error) {
                    showError(error instanceof Error ? error.message : 'Failed to add stage');
                  }
                }}
              >
                <Input value={stageName} onChange={(event) => setStageName(event.target.value)} placeholder="Add a stage" />
                <Button type="submit">Add</Button>
              </form>
            </Surface>
            <Surface className="p-6">
              <p className="text-base font-semibold text-slate-900">Channel routing</p>
              <p className="mt-1 text-sm text-slate-500">Pick where each mapped channel should land.</p>
              <div className="mt-4 space-y-3">
                {CHANNEL_TYPES.map((channelType) => {
                  const rule = rules.find((item) => item.channelType === channelType && !item.assetId);
                  return (
                    <div key={channelType} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                      <ChannelMark channelType={channelType} />
                      <span className="flex-1 text-sm font-medium text-slate-800">{CHANNEL_LABELS[channelType]}</span>
                      <Select
                        value={
                          rule?.pipelineStageId
                            ? String(rule.pipelineStageId)
                            : defaultStage
                              ? String(defaultStage.id)
                              : undefined
                        }
                        onValueChange={(value) => void saveRouting(channelType, value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage.id} value={String(stage.id)}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </Surface>
          </div>
        ) : null}

        {tab === 'channels' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <Surface className="p-6">
              <p className="text-base font-semibold text-slate-900">Map an asset</p>
              <p className="mt-1 text-sm text-slate-500">Connect Facebook Business to fetch WhatsApp Phone Number IDs automatically, or type an ID by hand.</p>
              <div className="mt-4">
                <ConnectFacebookButton
                  tenantId={tenantId}
                  returnTo={`/agency/clients/${tenantId}`}
                  label="Fetch IDs from Facebook"
                />
              </div>
              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">Or add manually</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAssetType(value)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-colors',
                      assetType === value
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    <ChannelMark channelType={value} size="sm" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <form
                className="mt-5 space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSaving(true);
                  try {
                    await createAsset(tenantId, {
                      channelType: assetType,
                      externalId: assetId.trim(),
                      displayName: assetName.trim() || assetId.trim(),
                    });
                    showSuccess('Mapped to this client');
                    setAssetId('');
                    setAssetName('');
                    await load();
                  } catch (error) {
                    showError(error instanceof Error ? error.message : 'Mapping failed');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="externalId">External ID</Label>
                  <Input
                    id="externalId"
                    required
                    value={assetId}
                    onChange={(event) => setAssetId(event.target.value)}
                    placeholder="Page ID, IG ID, form ID, or WhatsApp number ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={assetName}
                    onChange={(event) => setAssetName(event.target.value)}
                    placeholder="Acme Facebook"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Saving...' : `Map ${CHANNEL_LABELS[assetType]}`}
                </Button>
              </form>
            </Surface>
            <Surface className="p-6">
              <p className="text-base font-semibold text-slate-900">Mapped IDs</p>
              <div className="mt-4 space-y-3">
                {assets.length === 0 ? (
                  <p className="text-sm leading-6 text-slate-500">
                    Nothing is mapped yet. Inbound events for unknown IDs go to quarantine instead of this client.
                  </p>
                ) : (
                  assets.map((asset) => (
                    <ChannelAssetRow key={asset.id} asset={asset} bordered />
                  ))
                )}
              </div>
            </Surface>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          {tab !== 'channels' ? (
            <Button
              onClick={() => setTab(tab === 'users' ? 'pipeline' : 'channels')}
            >
              Continue
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/agency/quarantine">Review quarantine</Link>
            </Button>
          )}
        </div>
      </AgencyOnly>
    </AppShell>
  );
}
