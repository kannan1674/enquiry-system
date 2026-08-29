'use client';

import { forwardRef, memo, InputHTMLAttributes, useState } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPasswordChecks,
  getPasswordStrength,
  isStrongPassword,
  PASSWORD_RULE_MESSAGE,
} from '@/lib/auth/password';

type AuthPasswordInputProps = {
  id: string;
  label: string;
  error?: string;
  showStrength?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'size'>;

export const AuthPasswordInput = memo(forwardRef<HTMLInputElement, AuthPasswordInputProps>(
  function AuthPasswordInput(
    { id, label, error, showStrength = false, value, onFocus, onBlur, className, ...inputProps },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const password = typeof value === 'string' ? value : '';
    const hasValue = password.length > 0;
    const checks = getPasswordChecks(password);
    const strength = getPasswordStrength(password);
    const valid = isStrongPassword(password);
    const invalid = Boolean(error) || (showStrength && hasValue && !valid);
    const labelActive = focused || hasValue;

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            {...inputProps}
            ref={ref}
            id={id}
            value={value}
            type={visible ? 'text' : 'password'}
            aria-invalid={invalid}
            className={cn(
              'h-12 w-full rounded-xl border bg-white px-4 pe-11 text-sm text-slate-900 outline-none transition-colors',
              'placeholder:text-transparent focus:ring-0',
              invalid
                ? 'border-red-500 focus:border-red-500'
                : focused
                  ? 'border-indigo-400'
                  : 'border-slate-300',
              className,
            )}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
          <label
            htmlFor={id}
            className={cn(
              'pointer-events-none absolute bg-white px-1 transition-all',
              labelActive
                ? 'left-3 top-0 -translate-y-1/2 text-xs'
                : 'left-4 top-1/2 -translate-y-1/2 text-sm',
              invalid ? 'text-red-500' : focused ? 'text-indigo-500' : 'text-slate-500',
            )}
          >
            {label}
          </label>
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {showStrength && hasValue ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Password Strength</span>
              <span className={strength.textClass}>{strength.label}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={cn('h-full rounded-full transition-all', strength.barClass)} />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {checks.map((rule) => (
                <span
                  key={rule.id}
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] font-medium',
                    rule.passed ? 'text-emerald-600' : 'text-red-500',
                  )}
                >
                  {rule.passed ? <Check className="size-3" /> : <X className="size-3" />}
                  {rule.label}
                </span>
              ))}
            </div>
            {!valid ? (
              <p className="text-xs font-medium leading-relaxed text-red-500">{PASSWORD_RULE_MESSAGE}</p>
            ) : null}
          </div>
        ) : error ? (
          <p className="text-xs font-medium text-red-500">{error}</p>
        ) : null}
      </div>
    );
  },
));
