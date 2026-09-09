// Cloudflare Pages Function for /api/appointments
export async function onRequestPost(context: any) {
  try {
    let body: any = {};
    try {
      body = await context.request.json();
    } catch (_) {
      body = {};
    }

    const appointment = {
      id: 'apt_' + Math.random().toString(36).substring(2, 11),
      patient_name: body.patient_name || 'Paciente por Voz',
      doctor_id: body.doctor_id || 'doc_yc83uckgmttqbj11',
      datetime: body.datetime || new Date().toISOString(),
      reason: body.reason || 'Consulta médica',
      status: 'confirmed',
      booked_via: body.booked_via || 'voice_agent',
      notes: body.notes || 'Agendado mediante Agente de Voz IA Web Speech',
      created_at: new Date().toISOString(),
      doctor_name: body.doctor_name || 'Dr. Alejandro Mendoza',
      doctor_specialty: body.doctor_specialty || 'Cardiología',
    };

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

export async function onRequestGet() {
  const defaultAppointments = [
    {
      id: 'apt_8gt61arlmttqbj13',
      patient_id: 'pat_anvm4atcmttqbj12',
      doctor_id: 'doc_39ebgkzzmttqbj11',
      datetime: '2026-09-09T10:00:00',
      duration: 30,
      reason: 'Control de cefalea y fatiga general',
      status: 'confirmed',
      notes: 'Agendado mediante el Agente de Voz IA de la clínica',
      booked_via: 'voice_agent',
      patient_name: 'María Fernanda López',
      patient_phone: '+34 612 345 678',
      doctor_name: 'Dra. Sofía Morales',
      doctor_specialty: 'Medicina General',
    },
    {
      id: 'apt_vwi5qpwimttqbj13',
      patient_id: 'pat_ltcghry1mttqbj12',
      doctor_id: 'doc_yc83uckgmttqbj11',
      datetime: '2026-09-09T11:30:00',
      duration: 30,
      reason: 'Seguimiento de presión arterial y electrocardiograma',
      status: 'confirmed',
      notes: 'Control periódico',
      booked_via: 'manual',
      patient_name: 'Carlos Eduardo Ruiz',
      patient_phone: '+34 655 987 321',
      doctor_name: 'Dr. Alejandro Mendoza',
      doctor_specialty: 'Cardiología',
    },
    {
      id: 'apt_xqt1csykmttqbj13',
      patient_id: 'pat_h25o9ic0mttqbj12',
      doctor_id: 'doc_ojolu4lpmttqbj12',
      datetime: '2026-09-10T09:30:00',
      duration: 30,
      reason: 'Revisión pediátrica semestral de desarrollo',
      status: 'pending',
      notes: 'Primera consulta infantil',
      booked_via: 'online',
      patient_name: 'Lucía Méndez Gómez',
      patient_phone: '+34 688 443 219',
      doctor_name: 'Dra. Elena Vargas',
      doctor_specialty: 'Pediatría',
    },
    {
      id: 'apt_dl3r0u20mttqbj13',
      patient_id: 'pat_r02ucbo9mttqbj12',
      doctor_id: 'doc_39ebgkzzmttqbj11',
      datetime: '2026-09-11T14:00:00',
      duration: 30,
      reason: 'Certificado de aptitud médica deportiva',
      status: 'confirmed',
      notes: 'Agendado por voz',
      booked_via: 'voice_agent',
      patient_name: 'Javier Ramos Delgado',
      patient_phone: '+34 633 778 899',
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
    let body: any = {};
    try {
      body = await context.request.json();
    } catch (_) {}

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
