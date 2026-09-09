// Cloudflare Pages Function for /api/appointments
export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const tenantSlug = request.headers.get('x-tenant-slug') || 'demo';
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {
      body = {};
    }

    const appointment = {
      id: 'apt_' + Math.random().toString(36).substring(2, 11),
      patient_id: body.patient_id || 'pat_bclrfygqmtukub36',
      patient_name: body.patient_name || 'Paciente',
      patient_phone: body.patient_phone || '+34 600 000 000',
      doctor_id: body.doctor_id || 'doc_9um6jsq7mtukub35',
      datetime: body.datetime || new Date().toISOString(),
      duration: body.duration || 30,
      reason: body.reason || 'Consulta médica',
      status: 'confirmed',
      booked_via: body.booked_via || 'voice_agent',
      notes: body.notes || 'Agendado mediante MediSchedule',
      created_at: new Date().toISOString(),
      doctor_name: body.doctor_name || 'Dra. Sofía Morales',
      doctor_specialty: body.doctor_specialty || 'Medicina General',
    };

    if (env?.DB) {
      try {
        const tenant = await env.DB.prepare('SELECT id FROM tenants WHERE slug = ?').bind(tenantSlug).first();
        if (tenant?.id) {
          await env.DB.prepare(
            `INSERT INTO appointments (id, tenant_id, patient_id, doctor_id, datetime, duration, reason, status, notes, booked_via)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            appointment.id,
            tenant.id,
            appointment.patient_id,
            appointment.doctor_id,
            appointment.datetime,
            appointment.duration,
            appointment.reason,
            appointment.status,
            appointment.notes,
            appointment.booked_via
          ).run();
        }
      } catch (e) {
        console.warn('[D1 Pages] Error inserting appointment:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointment,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error creating appointment' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

export async function onRequestGet(context: any) {
  const { request, env } = context;
  const tenantSlug = request?.headers?.get('x-tenant-slug') || 'demo';

  if (env?.DB) {
    try {
      const res = await env.DB.prepare(
        `SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email, p.mrn as patient_mrn,
                d.name as doctor_name, d.specialty as doctor_specialty
         FROM appointments a
         JOIN tenants t ON a.tenant_id = t.id
         LEFT JOIN patients p ON a.patient_id = p.id
         LEFT JOIN doctors d ON a.doctor_id = d.id
         WHERE t.slug = ? ORDER BY a.datetime DESC`
      ).bind(tenantSlug).all();

      if (res.results && res.results.length > 0) {
        return new Response(
          JSON.stringify({ appointments: res.results, count: res.results.length }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            },
          }
        );
      }
    } catch (e) {
      console.warn('[D1 Pages] Error querying appointments:', e);
    }
  }

  const defaultAppointments = [
    {
      id: 'apt_93d57qcnmtukub37',
      patient_id: 'pat_bclrfygqmtukub36',
      doctor_id: 'doc_9um6jsq7mtukub35',
      datetime: '2026-09-09T10:00:00',
      duration: 30,
      reason: 'Control de cefalea y fatiga general',
      status: 'confirmed',
      notes: 'Agendado mediante el Agente de Voz IA de la clínica',
      booked_via: 'voice_agent',
      patient_name: 'María Fernanda López',
      patient_phone: '+34 612 345 678',
      patient_email: 'maria.lopez@example.com',
      patient_mrn: 'EXP-100234',
      doctor_name: 'Dra. Sofía Morales',
      doctor_specialty: 'Medicina General',
    },
    {
      id: 'apt_2e7dmi5vmtukub37',
      patient_id: 'pat_bymsx96dmtukub36',
      doctor_id: 'doc_047jgbd1mtukub35',
      datetime: '2026-09-09T11:30:00',
      duration: 30,
      reason: 'Seguimiento de presión arterial y electrocardiograma',
      status: 'confirmed',
      notes: null,
      booked_via: 'manual',
      patient_name: 'Carlos Eduardo Ruiz',
      patient_phone: '+34 655 987 321',
      patient_email: 'carlos.ruiz@example.com',
      patient_mrn: 'EXP-100582',
      doctor_name: 'Dr. Alejandro Mendoza',
      doctor_specialty: 'Cardiología',
    },
    {
      id: 'apt_ducxi85pmtukub37',
      patient_id: 'pat_9jnikz15mtukub36',
      doctor_id: 'doc_h7hj069rmtukub36',
      datetime: '2026-09-10T09:30:00',
      duration: 30,
      reason: 'Revisión pediátrica semestral de desarrollo',
      status: 'pending',
      notes: null,
      booked_via: 'online',
      patient_name: 'Lucía Méndez Gómez',
      patient_phone: '+34 688 443 219',
      patient_email: 'madre.lucia@example.com',
      patient_mrn: 'EXP-100911',
      doctor_name: 'Dra. Elena Vargas',
      doctor_specialty: 'Pediatría',
    },
    {
      id: 'apt_zzsztpnimtukub37',
      patient_id: 'pat_fqt9tkjjmtukub36',
      doctor_id: 'doc_9um6jsq7mtukub35',
      datetime: '2026-09-11T14:00:00',
      duration: 30,
      reason: 'Certificado de aptitud médica deportiva',
      status: 'confirmed',
      notes: 'Agendado por voz',
      booked_via: 'voice_agent',
      patient_name: 'Javier Ramos Delgado',
      patient_phone: '+34 633 778 899',
      patient_email: 'javier.ramos@example.com',
      patient_mrn: 'EXP-101402',
      doctor_name: 'Dra. Sofía Morales',
      doctor_specialty: 'Medicina General',
    },
  ];

  return new Response(
    JSON.stringify({ appointments: defaultAppointments, count: defaultAppointments.length }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    }
  );
}

export async function onRequestPatch(context: any) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {}

    if (env?.DB && body?.status && id) {
      try {
        await env.DB.prepare('UPDATE appointments SET status = ? WHERE id = ?').bind(body.status, id).run();
      } catch (e) {
        console.warn('[D1 Pages] Error updating appointment status:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: body,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error updating appointment' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
