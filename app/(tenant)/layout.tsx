import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TenantProvider } from '@/components/layout/TenantProvider';
import { getCurrentTenant } from '@/lib/tenant/getTenant';

export default async function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getCurrentTenant();

  return (
    <TenantProvider
      initialSlug={tenant?.slug || 'demo'}
      initialName={tenant?.name || 'Clínica San Rafael'}
    >
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
