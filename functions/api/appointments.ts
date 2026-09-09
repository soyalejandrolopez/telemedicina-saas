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
      doctor_id: body.doctor_id || 'doc_demo',
      datetime: body.datetime || new Date().toISOString(),
      reason: body.reason || 'Consulta médica',
      status: 'scheduled',
      booked_via: body.booked_via || 'voice_agent',
      notes: body.notes || 'Agendado mediante Agente de Voz IA Web Speech',
      created_at: new Date().toISOString(),
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
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
  return new Response(
    JSON.stringify({ appointments: [], count: 0 }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
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
