'use client';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type AuthOtpFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
};

export function AuthOtpField({ value, onChange, error, hint }: AuthOtpFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-[0.8rem] font-medium">OTP</Label>
      <InputOTP maxLength={6} value={value} onChange={onChange} containerClassName="justify-between gap-2">
        <InputOTPGroup className="w-full justify-between gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                '!size-12 !rounded-lg border-2 !border-slate-400 bg-white text-base font-semibold text-slate-900 shadow-sm first:!rounded-lg last:!rounded-lg first:!border-s-2',
                error && '!border-destructive',
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
