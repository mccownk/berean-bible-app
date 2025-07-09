
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always wrap in SessionProvider, even before mounting
  return (
    <NextAuthSessionProvider>
      <div style={{ opacity: mounted ? 1 : 0 }}>
        {children}
      </div>
    </NextAuthSessionProvider>
  );
}
