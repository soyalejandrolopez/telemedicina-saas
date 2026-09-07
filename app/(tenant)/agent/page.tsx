import React from 'react';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { listDoctors } from '@/lib/db/queries/doctors';
import { VoiceAgentRoom } from '@/components/voice/VoiceAgentRoom';

export default async function VoiceAgentPage() {
  const tenant = await getCurrentTenant();
  const doctors = listDoctors(tenant?.id || 'demo');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
          Agente de Voz IA Sanitario
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hable directamente con el asistente virtual para consultar médicos, explorar disponibilidad y agendar turnos en tiempo real.
        </p>
      </div>

      <VoiceAgentRoom doctors={doctors} tenantSlug={tenant?.slug || 'demo'} />
    </div>
  );
}
