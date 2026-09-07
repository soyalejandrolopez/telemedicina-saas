import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { getAvailableSlots } from '@/lib/db/queries/appointments';

export async function GET(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: 'Parámetros doctorId y date (YYYY-MM-DD) son requeridos' },
        { status: 400 }
      );
    }

    const slots = getAvailableSlots(tenant.id, doctorId, date);
    return NextResponse.json({ slots, count: slots.length, availableCount: slots.filter(s => s.available).length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
