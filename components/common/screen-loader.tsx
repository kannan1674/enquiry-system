'use client';

import { LoaderCircle } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';

export function ScreenLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f6f7fb]/85 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-7 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]">
        <img
          className="h-8 w-auto"
          src={toAbsoluteUrl('/media/app/mini-logo.svg')}
          alt="Enquiry System"
        />
        <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <LoaderCircle className="size-6 animate-spin" />
        </span>
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    </div>
  );
}
