// Cloudflare Pages Function for /api/slots
export async function onRequestGet(context: any) {
  try {
    const url = new URL(context.request.url);
    const doctorId = url.searchParams.get('doctorId') || 'doc_demo';
    const dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const times = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const slots = times.map((time) => ({
      time,
      datetime: `${dateStr}T${time}:00`,
      available: true,
    }));

    return new Response(
      JSON.stringify({
        slots,
        count: slots.length,
        availableCount: slots.length,
        doctorId,
        date: dateStr,
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
      JSON.stringify({ error: err.message }),
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
