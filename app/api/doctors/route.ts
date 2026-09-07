import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { listDoctors, createDoctor } from '@/lib/db/queries/doctors';

export async function GET() {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const doctors = listDoctors(tenant.id);
    return NextResponse.json({ doctors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const body = await req.json();
    const { name, specialty, license_num, bio, photo_url } = body;

    if (!name || !specialty) {
      return NextResponse.json({ error: 'Nombre y especialidad son requeridos' }, { status: 400 });
    }

    const doctor = createDoctor(tenant.id, {
      name,
      specialty,
      license_num,
      bio,
      photo_url,
    });

    return NextResponse.json({ success: true, doctor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
