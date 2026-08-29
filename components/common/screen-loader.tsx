'use client';

import { LoaderCircle } from 'lucide-react';

export function ScreenLoader(_props?: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f6f7fb]/70">
      <LoaderCircle className="size-8 animate-spin text-indigo-600" />
    </div>
  );
}
