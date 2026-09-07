import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { listPatients, createPatient } from '@/lib/db/queries/patients';

export async function GET(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;

    const patients = listPatients(tenant.id, search);
    return NextResponse.json({ patients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const body = await req.json();
    const { name, dob, gender, phone, email, address, blood_type, allergies, medications, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre del paciente es obligatorio' }, { status: 400 });
    }

    const patient = createPatient(tenant.id, {
      name,
      dob,
      gender,
      phone,
      email,
      address,
      blood_type,
      allergies,
      medications,
      notes,
    });

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
