'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getMetaConnectUrl } from '@/lib/api/agencyApi';
import { showError } from '@/lib/utils/toast';

export function ConnectFacebookButton({
  tenantId,
  returnTo,
  label = 'Connect Facebook Business',
}: {
  tenantId?: number;
  returnTo?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      className="gap-2 bg-[#1877F2] hover:bg-[#166fe5]"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const result = await getMetaConnectUrl({
            tenantId,
            returnTo: returnTo || window.location.pathname,
          });
          window.location.href = result.url;
        } catch (error) {
          showError(error instanceof Error ? error.message : 'Facebook login is not ready');
          setBusy(false);
        }
      }}
    >
      {busy ? 'Opening Facebook...' : label}
    </Button>
  );
}
