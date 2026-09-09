// Cloudflare Pages Function for /api/patients
export async function onRequestGet(context: any) {
  try {
    const { request, env } = context;
    const tenantSlug = request?.headers?.get('x-tenant-slug') || 'demo';

    if (env?.DB) {
      try {
        const res = await env.DB.prepare(
          `SELECT p.* FROM patients p 
           JOIN tenants t ON p.tenant_id = t.id 
           WHERE t.slug = ? ORDER BY p.created_at DESC`
        ).bind(tenantSlug).all();

        if (res.results && res.results.length > 0) {
          return new Response(
            JSON.stringify({ patients: res.results, count: res.results.length }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': '*',
              },
            }
          );
        }
      } catch (e) {
        console.warn('[D1 Pages] Error querying patients:', e);
      }
    }

    const defaultPatients = [
      {
        id: 'pat_bclrfygqmtukub36',
        mrn: 'EXP-100234',
        name: 'María Fernanda López',
        dob: '1989-04-12',
        gender: 'femenino',
        phone: '+34 612 345 678',
        email: 'maria.lopez@example.com',
        blood_type: 'O+',
        allergies: '["Penicilina","Ibuprofeno"]',
        medications: '["Loratadina 10mg"]',
        notes: 'Paciente con rinitis alérgica estacional. Prefiere citas a primera hora.',
      },
      {
        id: 'pat_bymsx96dmtukub36',
        mrn: 'EXP-100582',
        name: 'Carlos Eduardo Ruiz',
        dob: '1975-11-23',
        gender: 'masculino',
        phone: '+34 655 987 321',
        email: 'carlos.ruiz@example.com',
        blood_type: 'A+',
        allergies: '[]',
        medications: '["Losartán 50mg","Aspirina 100mg"]',
        notes: 'Hipertensión arterial grado 1 en control. Requiere monitoreo de presión.',
      },
      {
        id: 'pat_9jnikz15mtukub36',
        mrn: 'EXP-100911',
        name: 'Lucía Méndez Gómez',
        dob: '2018-06-15',
        gender: 'femenino',
        phone: '+34 688 443 219',
        email: 'madre.lucia@example.com',
        blood_type: 'B+',
        allergies: '["Frutos secos"]',
        medications: '["Salbutamol aerosol si crisis"]',
        notes: 'Control de crecimiento pediátrico al día.',
      },
      {
        id: 'pat_fqt9tkjjmtukub36',
        mrn: 'EXP-101402',
        name: 'Javier Ramos Delgado',
        dob: '1995-08-30',
        gender: 'masculino',
        phone: '+34 633 778 899',
        email: 'javier.ramos@example.com',
        blood_type: 'O-',
        allergies: '[]',
        medications: '[]',
        notes: 'Chequeo de medicina general y aptitud física deportiva.',
      },
    ];

    return new Response(
      JSON.stringify({
        patients: defaultPatients,
        count: defaultPatients.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error fetching patients' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}

export async function onRequestPost(context: any) {
  try {
    let body: any = {};
    try {
      body = await context.request.json();
    } catch (_) {
      body = {};
    }

    const patient = {
      id: 'pat_' + Math.random().toString(36).substring(2, 11),
      mrn: 'EXP-' + Math.floor(100000 + Math.random() * 900000),
      name: body.name || 'Nuevo Paciente',
      dob: body.dob || '1990-01-01',
      gender: body.gender || 'otro',
      phone: body.phone || '+34 600 000 000',
      email: body.email || 'paciente@example.com',
      blood_type: body.blood_type || 'Desconocido',
      allergies: JSON.stringify(body.allergies || []),
      medications: JSON.stringify(body.medications || []),
      notes: body.notes || 'Registrado desde portal clínico',
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        patient,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error creating patient' }),
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
