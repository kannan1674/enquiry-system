import { apiRequest } from './client';
import { clearCached, getCached, setCached } from './cache';

export type Tenant = {
  id: number;
  clientCode: string;
  companyName: string;
  status: string;
  timezone: string;
  createdAt: string;
  usersCount?: number;
  pendingInvitesCount?: number;
  assetsCount?: number;
  stagesCount?: number;
  mappedChannels?: string[];
};

export type TenantUser = {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  role: string;
  status: string;
};

export type UserInvite = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  expiresAt: string;
  acceptedAt: string | null;
};

export type PipelineStage = {
  id: number;
  name: string;
  sortOrder: number;
  isDefault: boolean;
};

export type RoutingRule = {
  id: number;
  channelType: string | null;
  assetId: number | null;
  pipelineStageId: number;
  assigneeUserId: number | null;
};

export type ChannelAsset = {
  id: number;
  channelType: 'facebook_page' | 'instagram' | 'lead_form' | 'whatsapp';
  externalId: string;
  displayName: string;
  status: string;
};

export type QuarantineItem = {
  id: number;
  channelType: string;
  externalAssetId: string;
  externalEventId: string | null;
  payload: Record<string, unknown>;
  status: string;
  receivedAt: string;
};

export const CHANNEL_LABELS: Record<string, string> = {
  facebook_page: 'Facebook Page',
  instagram: 'Instagram account',
  lead_form: 'Lead form',
  whatsapp: 'WhatsApp number',
};

export function listTenants() {
  const cached = getCached<{ tenants: Tenant[] }>('tenants', 60_000);
  if (cached) {
    return Promise.resolve(cached);
  }
  return apiRequest<{ tenants: Tenant[] }>('/tenants').then((data) => {
    setCached('tenants', data);
    return data;
  });
}

export function createTenant(body: { companyName: string; clientCode?: string; timezone?: string }) {
  return apiRequest<{ tenant: Tenant; message: string }>('/tenants', { method: 'POST', body }).then((data) => {
    clearCached('tenants');
    return data;
  });
}

export function getTenant(tenantId: number) {
  return apiRequest<{ tenant: Tenant }>(`/tenants/${tenantId}`);
}

export function listTenantUsers(tenantId: number) {
  return apiRequest<{ users: TenantUser[] }>(`/tenants/${tenantId}/users`);
}

export function listInvites(tenantId: number) {
  return apiRequest<{ invites: UserInvite[] }>(`/tenants/${tenantId}/invites`);
}

export function createInvite(tenantId: number, body: { email: string; name?: string; role: string }) {
  return apiRequest<{ invite: UserInvite; message: string }>(`/tenants/${tenantId}/invites`, {
    method: 'POST',
    body,
  });
}

export function listPipeline(tenantId: number) {
  return apiRequest<{ stages: PipelineStage[]; routingRules: RoutingRule[] }>(
    `/tenants/${tenantId}/pipeline`,
  );
}

export function createStage(tenantId: number, body: { name: string; isDefault?: boolean }) {
  return apiRequest<{ stage: PipelineStage }>(`/tenants/${tenantId}/pipeline/stages`, {
    method: 'POST',
    body,
  });
}

export function upsertRouting(tenantId: number, body: {
  pipelineStageId: number;
  channelType?: string | null;
  assetId?: number | null;
  assigneeUserId?: number | null;
}) {
  return apiRequest<{ routingRule: RoutingRule }>(`/tenants/${tenantId}/pipeline/routing`, {
    method: 'POST',
    body,
  });
}

export function listAssets(tenantId: number) {
  return apiRequest<{ assets: ChannelAsset[]; channelTypes: string[] }>(`/tenants/${tenantId}/assets`);
}

export function createAsset(tenantId: number, body: {
  channelType: string;
  externalId: string;
  displayName: string;
}) {
  return apiRequest<{ asset: ChannelAsset }>(`/tenants/${tenantId}/assets`, { method: 'POST', body });
}

export function listQuarantine(status = 'pending') {
  const key = `quarantine:${status}`;
  const cached = getCached<{ items: QuarantineItem[] }>(key, 20_000);
  if (cached) {
    return Promise.resolve(cached);
  }
  return apiRequest<{ items: QuarantineItem[] }>(`/quarantine?status=${encodeURIComponent(status)}`).then((data) => {
    setCached(key, data);
    return data;
  });
}

export function mapQuarantine(id: number, body: { tenantId: number; displayName?: string }) {
  return apiRequest<{ message: string }>(`/quarantine/${id}/map`, { method: 'POST', body }).then((data) => {
    clearCached('quarantine:pending');
    return data;
  });
}

export function dismissQuarantine(id: number) {
  return apiRequest<{ message: string }>(`/quarantine/${id}/dismiss`, { method: 'POST' }).then((data) => {
    clearCached('quarantine:pending');
    return data;
  });
}

export type Enquiry = {
  id: number;
  tenantId: number;
  companyName: string | null;
  clientCode: string | null;
  channelType: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  message: string | null;
  status: string;
  assetName: string | null;
  assetExternalId: string | null;
  stageName: string | null;
  createdAt: string;
};

export function listEnquiries(tenantId?: number) {
  const key = `enquiries:${tenantId || 'all'}`;
  const cached = getCached<{ enquiries: Enquiry[] }>(key, 15_000);
  if (cached) {
    return Promise.resolve(cached);
  }
  const query = tenantId ? `?tenantId=${tenantId}` : '';
  return apiRequest<{ enquiries: Enquiry[] }>(`/enquiries${query}`).then((data) => {
    setCached(key, data);
    return data;
  });
}

export function syncEnquiries() {
  return apiRequest<{
    message: string;
    pulled: number;
    routed: number;
    quarantined: number;
    duplicates: number;
    skipped: number;
  }>('/enquiries/sync', { method: 'POST' }).then((data) => {
    clearCached('enquiries:all');
    return data;
  });
}

export type EnquiryStatusOption = {
  value: string;
  label: string;
};

export function listEnquiryStatuses() {
  const cached = getCached<{
    success: boolean;
    canEditStatus: boolean;
    statuses: EnquiryStatusOption[];
  }>('enquiry-statuses', 5 * 60_000);
  if (cached) {
    return Promise.resolve(cached);
  }
  return apiRequest<{
    success: boolean;
    canEditStatus: boolean;
    statuses: EnquiryStatusOption[];
  }>('/enquiries/statuses').then((data) => {
    setCached('enquiry-statuses', data);
    return data;
  });
}

export function updateEnquiryStatus(enquiryId: number, status: string) {
  return apiRequest<{ success?: boolean; message?: string; status?: string }>(
    `/enquiries/${enquiryId}/status`,
    { method: 'PATCH', body: { status } },
  ).then((data) => {
    clearCached('enquiries:all');
    return data;
  });
}

export function getInvite(token: string) {
  return apiRequest<{
    invite: { email: string; name: string | null; role: string; companyName: string; expiresAt: string };
  }>(`/invites/${token}`, { auth: false });
}

export function acceptInvite(
  token: string,
  body: { name: string; mobile?: string; password: string; confirmPassword: string },
) {
  return apiRequest<{
    email?: string;
    message: string;
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      mobile: string | null;
      role: string;
      tenantId: number | null;
      authorisedClientIds: number[];
    };
  }>(`/invites/${token}/accept`, {
    method: 'POST',
    body,
    auth: false,
  });
}

export type MetaAsset = {
  id: number;
  channelType: string;
  externalId: string;
  displayName: string;
  tenantId: number;
};

export type MetaStatus = {
  configured: boolean;
  appId: string | null;
  configId: string | null;
  graphVersion: string;
  connected: boolean;
  facebookName: string | null;
  facebookUserId: string | null;
  lastSyncedAt: string | null;
  tenantId: number | null;
  companyName: string | null;
  assets: MetaAsset[];
};

export function getMetaStatus() {
  const cached = getCached<MetaStatus>('meta-status', 30_000);
  if (cached) {
    return Promise.resolve(cached);
  }
  return apiRequest<MetaStatus>('/meta/status').then((data) => {
    setCached('meta-status', data);
    return data;
  });
}

export function setupMetaApp(body: { appId: string; appSecret: string; configId?: string }) {
  return apiRequest<{ message: string; appId: string; configId: string | null }>('/meta/setup', {
    method: 'POST',
    body,
  }).then((data) => {
    clearCached('meta-status');
    return data;
  });
}

export function getMetaConnectUrl(body: { tenantId?: number; returnTo?: string } = {}) {
  const params = new URLSearchParams();
  if (body.tenantId) {
    params.set('tenantId', String(body.tenantId));
  }
  if (body.returnTo) {
    params.set('returnTo', body.returnTo);
  }
  const query = params.toString();
  return apiRequest<{ url: string; tenantId: number }>(`/meta/connect-url${query ? `?${query}` : ''}`);
}

export function completeMetaLogin(body: {
  tenantId?: number;
  code?: string;
  accessToken?: string;
  phoneNumberId?: string;
  wabaId?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
}) {
  return apiRequest<{
    message: string;
    whatsappCount: number;
    pageCount: number;
    instagramCount: number;
    companyName: string | null;
  }>('/meta/complete', { method: 'POST', body }).then((data) => {
    clearCached('meta-status');
    return data;
  });
}

export function syncMetaConnection(tenantId?: number) {
  return apiRequest<{
    message: string;
    whatsappCount: number;
    pageCount: number;
    instagramCount: number;
    companyName: string | null;
  }>('/meta/sync', { method: 'POST', body: tenantId ? { tenantId } : {} }).then((data) => {
    clearCached('meta-status');
    return data;
  });
}

export type AdInsight = {
  adId: string;
  adName: string;
  campaignId?: string;
  campaignName?: string;
  queryCount: number;
  uniqueCustomers?: number;
  amount: number;
  amountType?: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  currency: string;
  status?: string;
  firstQueryAt?: string;
  lastQueryAt?: string;
};

export type AdsReport = {
  success: boolean;
  startDate: string;
  endDate: string;
  timezone: string;
  adsRun: number;
  totalQueries: number;
  totalAmount: number;
  currency: string;
  ads: AdInsight[];
};

export type AdDetailResponse = {
  success: boolean;
  startDate: string;
  endDate: string;
  timezone: string;
  ad: AdInsight;
};

function adsQuery(params?: { startDate?: string; endDate?: string; tenantId?: number }) {
  const search = new URLSearchParams();
  if (params?.startDate) {
    search.set('startDate', params.startDate);
  }
  if (params?.endDate) {
    search.set('endDate', params.endDate);
  }
  if (params?.tenantId) {
    search.set('tenantId', String(params.tenantId));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function adsReportCacheKey(params?: { startDate?: string; endDate?: string; tenantId?: number; userId?: number }) {
  return `ads-report:${params?.userId || 'anon'}:${adsQuery(params)}`;
}

export function getAdsReport(
  params?: { startDate?: string; endDate?: string; tenantId?: number; userId?: number },
  options?: { skipCache?: boolean },
) {
  const query = adsQuery(params);
  const key = adsReportCacheKey(params);
  if (!options?.skipCache) {
    const cached = getCached<AdsReport>(key, 8_000);
    if (cached) {
      return Promise.resolve(cached);
    }
  }
  return apiRequest<AdsReport>(`/ads/report${query}`).then((data) => {
    setCached(key, data);
    return data;
  });
}

export function getAdInsight(
  adId: string,
  params?: { startDate?: string; endDate?: string; tenantId?: number },
) {
  return apiRequest<AdDetailResponse>(`/ads/${encodeURIComponent(adId)}${adsQuery(params)}`);
}
