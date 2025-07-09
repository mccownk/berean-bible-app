
'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { AppNavigation } from '@/components/layout/app-navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Loader2 } from 'lucide-react';

interface ClientAppLayoutProps {
  children: ReactNode;
}

export function ClientAppLayout({ children }: ClientAppLayoutProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header for desktop */}
      <AppHeader className="hidden md:block" />
      
      {/* Main content */}
      <main className="pb-20 md:pb-0 md:pt-16">
        {children}
      </main>
      
      {/* Bottom navigation for mobile */}
      <AppNavigation className="fixed bottom-0 left-0 right-0 md:hidden" />
    </div>
  );
}
