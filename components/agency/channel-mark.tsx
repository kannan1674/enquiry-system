'use client';

import { memo } from 'react';
import { ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHANNEL_LABELS } from '@/lib/api/agencyApi';

const ICONS: Record<string, string> = {
  facebook_page: '/media/brand-logos/facebook.svg',
  instagram: '/media/brand-logos/instagram-2.svg',
  whatsapp: '/media/brand-logos/whatsapp.png',
};

export const ChannelMark = memo(function ChannelMark({
  channelType,
  size = 'md',
}: {
  channelType: string;
  size?: 'sm' | 'md';
}) {
  const src = ICONS[channelType];
  const box = size === 'sm' ? 'size-7' : 'size-9';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5',
        box,
      )}
    >
      {src ? (
        <img src={src} alt="" className={size === 'sm' ? 'size-4' : 'size-5'} />
      ) : (
        <ClipboardList className={size === 'sm' ? 'size-3.5 text-indigo-600' : 'size-4 text-indigo-600'} />
      )}
    </span>
  );
});

export const ChannelLabel = memo(function ChannelLabel({ channelType }: { channelType: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <ChannelMark channelType={channelType} size="sm" />
      <span>{CHANNEL_LABELS[channelType] || channelType}</span>
    </span>
  );
});
