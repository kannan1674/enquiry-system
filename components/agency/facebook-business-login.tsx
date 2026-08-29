'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { completeMetaLogin } from '@/lib/api/agencyApi';
import { showError, showSuccess } from '@/lib/utils/toast';

type FacebookAuthResponse = {
  code?: string;
  accessToken?: string;
  expiresIn?: number;
};

type FacebookLoginResponse = {
  authResponse?: FacebookAuthResponse;
};

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (callback: (response: FacebookLoginResponse) => void, options: Record<string, unknown>) => void;
    };
    fbAsyncInit?: () => void;
  }
}

function loadFacebookSdk(appId: string, version: string) {
  if (window.FB) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version,
      });
      resolve();
    };

    const existing = document.getElementById('facebook-jssdk');
    if (existing) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.onerror = () => reject(new Error('Could not load Facebook'));
    document.body.appendChild(script);
  });
}

export function FacebookBusinessLogin({
  tenantId,
  appId,
  configId,
  graphVersion = 'v21.0',
  onConnected,
}: {
  tenantId?: number;
  appId?: string | null;
  configId?: string | null;
  graphVersion?: string;
  onConnected?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<{ phoneNumberId?: string; wabaId?: string }>({});

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return;
      }
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (payload?.type !== 'WA_EMBEDDED_SIGNUP') {
          return;
        }
        const data = payload.data || {};
        sessionRef.current = {
          phoneNumberId: data.phone_number_id || data.phoneNumberId,
          wabaId: data.waba_id || data.wabaId,
        };
      } catch {
        // Ignore other Facebook messages.
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!appId) {
    return null;
  }

  return (
    <Button
      type="button"
      className="gap-2 bg-[#1877F2] hover:bg-[#166fe5]"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        sessionRef.current = {};
        try {
          await loadFacebookSdk(appId, graphVersion);
          if (!window.FB) {
            throw new Error('Facebook is not ready');
          }

          const loginOptions: Record<string, unknown> = {
            response_type: 'code',
            override_default_response_type: true,
            extras: {
              setup: {},
              featureType: '',
              sessionInfoVersion: '3',
            },
          };
          if (configId) {
            loginOptions.config_id = configId;
          } else {
            loginOptions.scope = [
              'business_management',
              'whatsapp_business_management',
              'whatsapp_business_messaging',
              'pages_show_list',
            ].join(',');
          }

          window.FB.login(async (response) => {
            try {
              const auth = response.authResponse;
              if (!auth?.code && !auth?.accessToken) {
                throw new Error('Facebook login was cancelled');
              }

              const result = await completeMetaLogin({
                tenantId,
                code: auth.code,
                accessToken: auth.accessToken,
                phoneNumberId: sessionRef.current.phoneNumberId,
                wabaId: sessionRef.current.wabaId,
              });
              showSuccess(result.message);
              onConnected?.();
            } catch (error) {
              showError(error instanceof Error ? error.message : 'Facebook login failed');
            } finally {
              setBusy(false);
            }
          }, loginOptions);
        } catch (error) {
          showError(error instanceof Error ? error.message : 'Facebook login failed');
          setBusy(false);
        }
      }}
    >
      {busy ? 'Connecting Facebook...' : 'Continue with Facebook'}
    </Button>
  );
}
