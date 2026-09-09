// Cloudflare Pages Function for /api/tenants
export async function onRequestPost(context: any) {
  try {
    let body: any = {};
    try {
      body = await context.request.json();
    } catch (_) {
      body = {};
    }

    const tenant = {
      id: 't_' + Math.random().toString(36).substring(2, 11),
      name: body.name || 'Clínica Demo',
      slug: (body.slug || 'clinica-demo').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      plan: body.plan || 'starter',
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        tenant,
        message: 'Clínica registrada correctamente',
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
      JSON.stringify({ error: err.message || 'Error creating tenant' }),
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
