import { headers } from 'next/headers';
import { getTenantBySlug } from '../db/queries/tenants';
import { Tenant } from '../db/schema';

export async function getCurrentTenant(): Promise<Tenant | null> {
  const headerList = headers();
  const slug = headerList.get('x-tenant-slug') || 'demo';
  return getTenantBySlug(slug);
}
