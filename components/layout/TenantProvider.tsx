'use client';

import React, { createContext, useContext, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface TenantContextValue {
  slug: string;
  name: string;
  subdomain: string;
  setTenantSlug: (slug: string) => void;
}

const TenantContext = createContext<TenantContextValue>({
  slug: 'demo',
  name: 'Clínica San Rafael',
  subdomain: 'san-rafael.medischedule.com',
  setTenantSlug: () => {},
});

export function TenantProvider({
  initialSlug = 'demo',
  initialName = 'Clínica San Rafael',
  children,
}: {
  initialSlug?: string;
  initialName?: string;
  children: React.ReactNode;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const [name, setName] = useState(initialName);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const setTenantSlug = (newSlug: string) => {
    setSlug(newSlug);
    if (newSlug === 'demo' || newSlug === 'san-rafael') {
      setName('Clínica San Rafael');
    } else {
      setName(`Clínica ${newSlug.toUpperCase()}`);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TenantContext.Provider
        value={{
          slug,
          name,
          subdomain: `${slug}.medischedule.com`,
          setTenantSlug,
        }}
      >
        {children}
      </TenantContext.Provider>
    </QueryClientProvider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
