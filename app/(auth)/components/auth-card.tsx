import { ReactNode } from 'react';

type AuthCardProps = {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ icon, title, subtitle, children }: AuthCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-28px_rgba(15,23,42,0.55)] sm:p-6">
      <div className="mb-5 space-y-2.5">
        {icon ? (
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            {icon}
          </div>
        ) : null}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
