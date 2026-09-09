// Cloudflare Pages Function for /api/doctors
export async function onRequestGet(context: any) {
  try {
    const { request, env } = context;
    const tenantSlug = request?.headers?.get('x-tenant-slug') || 'demo';

    if (env?.DB) {
      try {
        const res = await env.DB.prepare(
          `SELECT d.* FROM doctors d 
           JOIN tenants t ON d.tenant_id = t.id 
           WHERE t.slug = ? AND d.active = 1`
        ).bind(tenantSlug).all();

        if (res.results && res.results.length > 0) {
          return new Response(
            JSON.stringify({ doctors: res.results, count: res.results.length }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': '*',
              },
            }
          );
        }
      } catch (e) {
        console.warn('[D1 Pages] Error querying doctors:', e);
      }
    }

    const defaultDoctors = [
      {
        id: 'doc_9um6jsq7mtukub35',
        name: 'Dra. Sofía Morales',
        specialty: 'Medicina General',
        license_num: 'COL-MED-84920',
        bio: 'Especialista en medicina preventiva, control de enfermedades crónicas y chequeos integrales con más de 12 años de experiencia clínica.',
        active: 1,
      },
      {
        id: 'doc_047jgbd1mtukub35',
        name: 'Dr. Alejandro Mendoza',
        specialty: 'Cardiología',
        license_num: 'COL-MED-62118',
        bio: 'Cardiólogo clínico intervencionista, experto en hipertensión arterial, ecocardiografía y arritmias.',
        active: 1,
      },
      {
        id: 'doc_h7hj069rmtukub36',
        name: 'Dra. Elena Vargas',
        specialty: 'Pediatría',
        license_num: 'COL-MED-93451',
        bio: 'Atención pediátrica integral, control del niño sano y urgencias respiratorias infantiles.',
        active: 1,
      },
    ];

    return new Response(
      JSON.stringify({
        doctors: defaultDoctors,
        count: defaultDoctors.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error fetching doctors' }),
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
