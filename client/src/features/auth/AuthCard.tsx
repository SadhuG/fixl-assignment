import type { ReactNode } from 'react';
import Logo from '@/components/Logo';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-panel border border-line bg-surface p-6 shadow-sm">
          <h1 className="text-h1 font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          <div className="mt-6 space-y-4">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-small text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}
