import { getDb, generateId } from '../client';
import { Tenant, User } from '../schema';

export function getTenantBySlug(slug: string): Tenant | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM tenants WHERE slug = ? AND active = 1');
  return (stmt.get(slug) as Tenant) || null;
}

export function getTenantById(id: string): Tenant | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM tenants WHERE id = ? AND active = 1');
  return (stmt.get(id) as Tenant) || null;
}

export function createTenant(data: {
  name: string;
  slug: string;
  plan?: 'free' | 'pro' | 'enterprise';
  adminEmail: string;
  adminPasswordHash: string;
  adminName: string;
}): { tenant: Tenant; adminUser: User } {
  const db = getDb();
  const tenantId = 't_' + generateId();
  const userId = 'u_' + generateId();
  const subdomain = `${data.slug}.medischedule.com`;

  const insertTenant = db.prepare(`
    INSERT INTO tenants (id, name, slug, subdomain, plan, config, active)
    VALUES (?, ?, ?, ?, ?, '{}', 1)
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, tenant_id, email, password_hash, name, role, active)
    VALUES (?, ?, ?, ?, ?, 'admin', 1)
  `);

  const tx = db.transaction(() => {
    insertTenant.run(tenantId, data.name, data.slug, subdomain, data.plan || 'pro');
    insertUser.run(userId, tenantId, data.adminEmail.toLowerCase(), data.adminPasswordHash, data.adminName);
  });

  tx();

  const tenant = getTenantById(tenantId)!;
  const adminUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;

  return { tenant, adminUser };
}
