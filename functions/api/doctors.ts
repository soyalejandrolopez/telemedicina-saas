// Cloudflare Pages Function for /api/doctors
export async function onRequestGet(context: any) {
  try {
    const defaultDoctors = [
      {
        id: 'doc_yc83uckgmttqbj11',
        name: 'Dr. Alejandro Mendoza',
        specialty: 'Cardiología',
        license_num: 'COL-MED-62118',
        bio: 'Cardiólogo clínico intervencionista, experto en hipertensión arterial, ecocardiografía y arritmias.',
        active: 1,
      },
      {
        id: 'doc_ojolu4lpmttqbj12',
        name: 'Dra. Elena Vargas',
        specialty: 'Pediatría',
        license_num: 'COL-MED-93451',
        bio: 'Atención pediátrica integral, control del niño sano y urgencias respiratorias infantiles.',
        active: 1,
      },
      {
        id: 'doc_39ebgkzzmttqbj11',
        name: 'Dra. Sofía Morales',
        specialty: 'Medicina General',
        license_num: 'COL-MED-84920',
        bio: 'Especialista en medicina preventiva, control de enfermedades crónicas y chequeos integrales con más de 12 años de experiencia clínica.',
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
