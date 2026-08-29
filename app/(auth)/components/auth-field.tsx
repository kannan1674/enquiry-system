'use client';

import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { Input, InputWrapper } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AuthFieldProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  error?: string;
  hint?: ReactNode;
};

export function AuthField({ id, label, icon: Icon, children, error, hint }: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[0.8rem] font-medium">
        {label}
      </Label>
      <InputWrapper
        variant="lg"
        className={cn(
          'bg-white border-slate-300',
          error && 'border-destructive/60 ring-3 ring-destructive/10',
        )}
      >
        <Icon className={cn('size-4 shrink-0', error ? 'text-destructive' : 'text-muted-foreground')} />
        {children}
      </InputWrapper>
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : hint}
    </div>
  );
}

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'size'>;

export function AuthPasswordField({
  id,
  label,
  icon: Icon,
  error,
  ...inputProps
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[0.8rem] font-medium">
        {label}
      </Label>
      <InputWrapper
        variant="lg"
        className={cn(
          'bg-white border-slate-300',
          error && 'border-destructive/60 ring-3 ring-destructive/10',
        )}
      >
        <Icon className={cn('size-4 shrink-0', error ? 'text-destructive' : 'text-muted-foreground')} />
        <Input id={id} type={visible ? 'text' : 'password'} aria-invalid={Boolean(error)} {...inputProps} />
        <Button
          type="button"
          variant="ghost"
          mode="icon"
          size="sm"
          className="-me-1.5 text-muted-foreground hover:text-foreground"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </InputWrapper>
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
