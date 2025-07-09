
import { ReactNode } from 'react';
import { ClientAppLayout } from '@/components/layout/client-app-layout';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ClientAppLayout>
      {children}
    </ClientAppLayout>
  );
}
