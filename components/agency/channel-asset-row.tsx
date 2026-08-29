'use client';

import { memo, type ComponentType } from 'react';
import Link from 'next/link';
import { ChannelMark } from '@/components/agency/channel-mark';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/app-shell';
import { CHANNEL_LABELS } from '@/lib/api/agencyApi';
import { cn } from '@/lib/utils';

type AssetRowData = {
  id: number;
  channelType: string;
  externalId: string;
  displayName: string;
};

export const ChannelAssetRow = memo(function ChannelAssetRow({
  asset,
  bordered,
}: {
  asset: AssetRowData;
  bordered?: boolean;
}) {
  const content = (
    <>
      <ChannelMark channelType={asset.channelType} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{asset.displayName}</p>
        <p className="truncate font-mono text-xs text-slate-400">{asset.externalId}</p>
      </div>
      <Badge variant="secondary">{CHANNEL_LABELS[asset.channelType] || asset.channelType}</Badge>
    </>
  );

  if (bordered) {
    return <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3">{content}</div>;
  }

  return <Surface className="p-4"><div className="flex items-center gap-3">{content}</div></Surface>;
});

export const HomeStepCard = memo(function HomeStepCard({
  href,
  title,
  text,
  index,
  icon: Icon,
}: {
  href: string;
  title: string;
  text: string;
  index: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} prefetch className="group">
      <Surface className="h-full p-5 transition-transform group-hover:-translate-y-0.5">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon className="size-4" />
          </span>
          <span className="text-xs font-semibold text-slate-400">0{index + 1}</span>
        </div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      </Surface>
    </Link>
  );
});

export const TenantUserRow = memo(function TenantUserRow({
  name,
  detail,
  role,
  pending,
}: {
  name: string;
  detail: string;
  role: string;
  pending?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl px-3 py-3',
        pending ? 'border border-dashed border-slate-200' : 'bg-slate-50',
      )}
    >
      <div>
        <p className="text-sm font-medium text-slate-900">{name}</p>
        <p className={cn('text-xs', pending ? 'text-amber-600' : 'text-slate-500')}>{detail}</p>
      </div>
      <Badge variant={pending ? 'outline' : 'secondary'}>{role}</Badge>
    </div>
  );
});
