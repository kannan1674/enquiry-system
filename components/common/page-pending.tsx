'use client';

import { memo } from 'react';
import { LoaderCircle } from 'lucide-react';

export const PagePending = memo(function PagePending() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoaderCircle className="size-6 animate-spin text-indigo-600" />
    </div>
  );
});
