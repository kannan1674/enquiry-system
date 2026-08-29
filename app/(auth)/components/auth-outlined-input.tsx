'use client';

import { forwardRef, memo, InputHTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

type AuthOutlinedInputProps = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'size'>;

export const AuthOutlinedInput = memo(forwardRef<HTMLInputElement, AuthOutlinedInputProps>(
  function AuthOutlinedInput(
    { id, label, error, hint, value, onFocus, onBlur, className, ...inputProps },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const text = typeof value === 'string' ? value : '';
    const hasValue = text.length > 0;
    const labelActive = focused || hasValue || Boolean(inputProps.readOnly);
    const invalid = Boolean(error);

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            {...inputProps}
            ref={ref}
            id={id}
            value={value}
            aria-invalid={invalid}
            className={cn(
              'h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-colors',
              'placeholder:text-transparent focus:ring-0',
              inputProps.readOnly && 'cursor-default bg-slate-50',
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
        </div>
        {error ? (
          <p className="text-xs font-medium text-red-500">{error}</p>
        ) : hint ? (
          hint
        ) : null}
      </div>
    );
  },
));
