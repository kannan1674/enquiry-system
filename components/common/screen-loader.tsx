'use client';

import { memo } from 'react';
import { LoaderCircle } from 'lucide-react';

type ScreenLoaderProps = {
  message?: string;
};

export const ScreenLoader = memo(function ScreenLoader(_props: ScreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f6f7fb]/70">
      <LoaderCircle className="size-8 animate-spin text-indigo-600" />
    </div>
  );
});
