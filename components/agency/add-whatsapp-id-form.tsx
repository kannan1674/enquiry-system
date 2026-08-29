'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Surface } from '@/components/app-shell';
import { createAsset } from '@/lib/api/agencyApi';
import { showError, showSuccess } from '@/lib/utils/toast';

export function AddWhatsAppIdForm({
  tenantId,
  onSaved,
}: {
  tenantId?: number;
  onSaved?: () => void;
}) {
  const [externalId, setExternalId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!tenantId) {
    return null;
  }

  return (
    <Surface className="p-6">
      <p className="text-base font-semibold text-slate-900">Add WhatsApp number</p>
      <p className="mt-1 text-sm text-slate-500">
        Paste the Phone Number ID from Meta WhatsApp → API Setup. This is not your mobile number.
      </p>
      <form
        className="mt-5 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          try {
            await createAsset(tenantId, {
              channelType: 'whatsapp',
              externalId: externalId.trim(),
              displayName: displayName.trim() || 'My WhatsApp',
            });
            showSuccess('WhatsApp ID saved');
            setExternalId('');
            setDisplayName('');
            onSaved?.();
          } catch (error) {
            showError(error instanceof Error ? error.message : 'Could not save WhatsApp ID');
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="phoneNumberId">Phone Number ID</Label>
          <Input
            id="phoneNumberId"
            required
            value={externalId}
            onChange={(event) => setExternalId(event.target.value)}
            placeholder="1322307004295660"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsappName">Display name</Label>
          <Input
            id="whatsappName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="My WhatsApp"
          />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? 'Saving...' : 'Save WhatsApp ID'}
        </Button>
      </form>
    </Surface>
  );
}
