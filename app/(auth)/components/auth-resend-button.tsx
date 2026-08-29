'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type AuthResendButtonProps = {
  onResend: () => Promise<boolean> | boolean;
  disabled?: boolean;
  cooldownSeconds?: number;
};

export function AuthResendButton({
  onResend,
  disabled,
  cooldownSeconds = 30,
}: AuthResendButtonProps) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full"
      disabled={disabled || secondsLeft > 0}
      onClick={async () => {
        const sent = await onResend();
        if (sent) {
          setSecondsLeft(cooldownSeconds);
        }
      }}
    >
      {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : 'Resend OTP'}
    </Button>
  );
}
