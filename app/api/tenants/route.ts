import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { createTenant } from '@/lib/db/queries/tenants';
import { hashPassword } from '@/lib/auth/password';
import { getDb } from '@/lib/db/client';

export async function GET() {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    return NextResponse.json({ tenant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, adminEmail, adminPassword, adminName, plan } = body;

    if (!name || !slug || !adminEmail || !adminPassword || !adminName) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const db = getDb();
    const existing = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(cleanSlug);
    if (existing) {
      return NextResponse.json({ error: 'El subdominio ya está en uso' }, { status: 409 });
    }

    const passwordHash = hashPassword(adminPassword);
    const { tenant, adminUser } = createTenant({
      name,
      slug: cleanSlug,
      plan: plan || 'pro',
      adminEmail,
      adminPasswordHash: passwordHash,
      adminName,
    });

    return NextResponse.json({
      success: true,
      tenant,
      adminUser: { id: adminUser.id, email: adminUser.email, name: adminUser.name },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
