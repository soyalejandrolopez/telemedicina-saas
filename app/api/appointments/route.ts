import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { listAppointments, createAppointment } from '@/lib/db/queries/appointments';
import { createPatient, listPatients } from '@/lib/db/queries/patients';

export async function GET(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date') || undefined;
    const doctorId = searchParams.get('doctorId') || undefined;
    const patientId = searchParams.get('patientId') || undefined;
    const status = searchParams.get('status') || undefined;

    const appointments = listAppointments(tenant.id, { date, doctorId, patientId, status });
    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const body = await req.json();
    let { patient_id, doctor_id, datetime, duration, reason, status, notes, booked_via, patient_name, patient_phone } = body;

    if (!doctor_id || !datetime) {
      return NextResponse.json(
        { error: 'doctor_id y datetime son obligatorios' },
        { status: 400 }
      );
    }

    // Auto-create or resolve patient if booked via voice agent or quick-booking
    if (!patient_id) {
      if (!patient_name) {
        return NextResponse.json(
          { error: 'Se requiere patient_id o patient_name' },
          { status: 400 }
        );
      }

      // Check if patient with this name exists in this tenant
      const existing = listPatients(tenant.id, patient_name);
      if (existing.length > 0) {
        patient_id = existing[0].id;
      } else {
        const newPatient = createPatient(tenant.id, {
          name: patient_name,
          phone: patient_phone || undefined,
          notes: 'Registrado automáticamente por el Agente de Voz IA',
        });
        patient_id = newPatient.id;
      }
    }

    const appointment = createAppointment(tenant.id, {
      patient_id,
      doctor_id,
      datetime,
      duration: duration || 30,
      reason: reason || 'Consulta general',
      status: status || 'confirmed',
      notes: notes || undefined,
      booked_via: booked_via || 'manual',
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    // Check if conflict error
    const isConflict = error.message?.includes('ya tiene una cita');
    return NextResponse.json(
      { error: error.message },
      { status: isConflict ? 409 : 500 }
    );
  }
}
