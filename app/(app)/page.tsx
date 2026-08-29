'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, GitBranch, LayoutDashboard, Radio, ShieldAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader, Surface } from '@/components/app-shell';
import { ChannelMark } from '@/components/agency/channel-mark';
import { HomeStepCard } from '@/components/agency/channel-asset-row';
import { useAppSelector } from '@/lib/store/hooks';
import { isAgencyAdmin, isDirectOwner } from '@/lib/auth/roles';

const AGENCY_STEPS = [
  {
    href: '/agency/clients',
    icon: Building2,
    title: 'Create a client',
    text: 'Add the company tenant first. Everything else is scoped to that client.',
  },
  {
    href: '/agency/clients',
    icon: Users,
    title: 'Invite their users',
    text: 'Send a client admin, manager, or executive into that company only.',
  },
  {
    href: '/agency/clients',
    icon: GitBranch,
    title: 'Set pipeline routing',
    text: 'Choose where Facebook, Instagram, lead forms, and WhatsApp land.',
  },
  {
    href: '/agency/clients',
    icon: Radio,
    title: 'Map channel IDs',
    text: 'Bind the exact Page, Instagram, form, and WhatsApp IDs. Unknown IDs never guess a client.',
  },
];

const DIRECT_STEPS = [
  {
    href: '/connections',
    icon: Radio,
    title: 'Connect Facebook',
    text: 'Login with your own Facebook Business account. Your WhatsApp Phone Number ID is fetched automatically.',
  },
  {
    href: '/workspace',
    icon: Building2,
    title: 'Check your channels',
    text: 'Confirm the WhatsApp number, Page, and Instagram IDs belong to your business.',
  },
  {
    href: '/enquiries',
    icon: Users,
    title: 'Read enquiries',
    text: 'When someone messages your WhatsApp or submits a lead, it appears in your inbox.',
  },
];

export default function HomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const agency = isAgencyAdmin(user?.role);
  const direct = isDirectOwner(user?.role);
  const firstName = useMemo(() => user?.name?.split(' ')[0] || 'there', [user?.name]);
  const steps = agency ? AGENCY_STEPS : DIRECT_STEPS;

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title={`Good to see you, ${firstName}`}
        // subtitle={
        //   direct
        //     ? `Signed in as ${roleLabel(user?.role)}. You are using this app directly, without an agency.`
        //     : `Signed in as ${roleLabel(user?.role)}. Agency users manage client companies. Direct users run their own ads.`
        // }
        action={
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              Open dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {agency || direct ? (
        <div className="space-y-6">
          <Link href="/dashboard" className="group block">
            <Surface className="overflow-hidden p-0 transition-transform group-hover:-translate-y-0.5">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[linear-gradient(135deg,#eef2ff_0%,#fff7ed_100%)] px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    <LayoutDashboard className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Ad insights</p>
                    <p className="mt-1 text-sm text-slate-500">
                      See ads run, WhatsApp queries, spend, and cost per enquiry.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                  Open dashboard
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Surface>
          </Link>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <HomeStepCard
                key={step.title}
                href={step.href}
                title={step.title}
                text={step.text}
                index={index}
                icon={step.icon}
              />
            ))}
          </div>

          {agency ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <Surface className="p-6 lg:col-span-2">
                <p className="text-sm font-semibold text-slate-900">Routing rule</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Every inbound event is matched to a mapped Facebook Page, Instagram account, lead form, or WhatsApp
                  number. If the ID is unknown, it goes to quarantine.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <ChannelMark channelType="facebook_page" />
                  <ChannelMark channelType="instagram" />
                  <ChannelMark channelType="lead_form" />
                  <ChannelMark channelType="whatsapp" />
                </div>
              </Surface>
              <Surface className="p-6">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="font-semibold text-slate-900">Quarantine first</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review unknown assets and map them to a client only when you are sure.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/agency/quarantine">Open quarantine</Link>
                </Button>
              </Surface>
            </div>
          ) : null}
        </div>
      ) : (
        <Surface className="p-8">
          <p className="text-base font-semibold text-slate-900">Your client workspace</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            You can only see enquiries for the company you were invited to.
          </p>
          <Button className="mt-5" asChild>
            <Link href="/enquiries">Open enquiries</Link>
          </Button>
        </Surface>
      )}
    </>
  );
}
