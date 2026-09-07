import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { getPatientById } from '@/lib/db/queries/patients';
import { getDb } from '@/lib/db/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const patient = getPatientById(tenant.id, params.id);
    if (!patient) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const body = await req.json();
    const db = getDb();

    const allowed = ['name', 'dob', 'gender', 'phone', 'email', 'address', 'blood_type', 'notes'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (body.allergies !== undefined) {
      updates.push(`allergies = ?`);
      values.push(JSON.stringify(body.allergies));
    }

    if (body.medications !== undefined) {
      updates.push(`medications = ?`);
      values.push(JSON.stringify(body.medications));
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(tenant.id, params.id);
      db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE tenant_id = ? AND id = ?`).run(...values);
    }

    const patient = getPatientById(tenant.id, params.id);
    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
