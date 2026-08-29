'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function AuthShell({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Image
        src="/media/auth/bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-violet-900/35" />

      <div className="relative z-10 grid h-full w-full lg:grid-cols-2">
        <div className="hidden h-full flex-col justify-between p-10 text-white lg:flex">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Enquiry System
          </Link>
          <div className="max-w-lg space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Enquiry CRM
            </p>
            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              For agencies and for you
            </h1>
            <p className="max-w-md text-base leading-relaxed text-white/80">
              Agencies manage many clients. Business owners can sign up and run
              their own Facebook, Instagram and WhatsApp leads without an agency.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img src="/media/brand-logos/facebook.svg" alt="Facebook" className="size-8 rounded-full bg-white/90 p-1.5" />
              <img src="/media/brand-logos/instagram-2.svg" alt="Instagram" className="size-8 rounded-full bg-white/90 p-1.5" />
              <img src="/media/brand-logos/whatsapp.png" alt="WhatsApp" className="size-8 rounded-full bg-white/90 p-1.5" />
            </div>
          </div>
          <p className="text-sm text-white/65">
            © {new Date().getFullYear()} Enquiry System
          </p>
        </div>

        <div className="h-full overflow-y-auto">
          <div className="flex min-h-full flex-col">
            <div className="flex items-center justify-between px-6 py-4 lg:justify-end">
              <Link href="/" className="text-base font-semibold text-white lg:hidden">
                Enquiry System
              </Link>
              <Button
                type="button"
                variant="ghost"
                mode="icon"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white"
                aria-label="Toggle theme"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
              >
                {isDark ? <Sun /> : <Moon />}
              </Button>
            </div>
            <div className="flex flex-1 flex-col justify-center px-4 pb-8 pt-2 sm:px-6">
              <div className="mx-auto w-full max-w-[460px]">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
