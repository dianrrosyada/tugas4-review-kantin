import type { ReactNode } from 'react';
import { cardClass } from '../lib/ui';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="mx-auto max-w-md py-4 sm:py-10">
      <div className={`${cardClass} p-6 sm:p-8`}>
        <h1 className="font-heading text-[28px] font-bold">{title}</h1>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-4 text-center text-sm text-text-muted">{footer}</p>
    </div>
  );
}

export default AuthLayout;
