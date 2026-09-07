import React from 'react';
import Link from 'next/link';
import { getCurrentTenant } from '@/lib/tenant/getTenant';
import { listAppointments } from '@/lib/db/queries/appointments';
import { listDoctors } from '@/lib/db/queries/doctors';
import { listPatients } from '@/lib/db/queries/patients';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge, SourceBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Users,
  Mic,
  Activity,
  ArrowUpRight,
  Clock,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();
  const tenantId = tenant?.id || 'demo';

  const today = new Date().toISOString().split('T')[0];
  const allAppointments = listAppointments(tenantId);
  const todayAppointments = allAppointments.filter((a) => a.datetime.startsWith(today));
  const voiceAppointments = allAppointments.filter((a) => a.booked_via === 'voice_agent');
  const doctors = listDoctors(tenantId);
  const patients = listPatients(tenantId);

  // Rate of appointments booked via voice
  const voiceRate =
    allAppointments.length > 0
      ? Math.round((voiceAppointments.length / allAppointments.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
            Panel de Gestión Clínica
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenido a {tenant?.name || 'MediSchedule'}. Monitoreo en tiempo real de consultas y agente de voz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/agent">
            <Button
              variant="accent"
              className="shadow-md shadow-medical-teal/20"
              leftIcon={<Mic className="w-4 h-4 text-white animate-pulse" />}
            >
              Iniciar Agente de Voz
            </Button>
          </Link>
          <Link href="/appointments">
            <Button variant="secondary" leftIcon={<Calendar className="w-4 h-4" />}>
              Ver Calendario
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Citas Hoy */}
        <Card className="relative overflow-hidden border-sky-100 bg-gradient-to-br from-white to-sky-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Citas Hoy</span>
            <div className="h-9 w-9 rounded-xl bg-sky-100 text-brand-800 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-brand-900" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-900 font-heading">
              {todayAppointments.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> En curso
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {allAppointments.length} citas totales registradas
          </p>
        </Card>

        {/* Stat 2: Agendadas por Voz */}
        <Card className="relative overflow-hidden border-teal-100 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-medical-emerald">
              Agente de Voz IA
            </span>
            <div className="h-9 w-9 rounded-xl bg-medical-mint text-medical-emerald flex items-center justify-center">
              <Mic className="w-4 h-4 text-medical-teal" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-900 font-heading">
              {voiceAppointments.length}
            </span>
            <span className="text-xs text-medical-emerald font-bold bg-white px-1.5 py-0.5 rounded-md border border-medical-teal/30">
              {voiceRate}% del total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sin costo de API externa (Web Speech)</p>
        </Card>

        {/* Stat 3: Pacientes */}
        <Card className="relative overflow-hidden border-purple-100 bg-gradient-to-br from-white to-purple-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Directorio Clínico
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-900 font-heading">
              {patients.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Pacientes</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Con expediente médico digital</p>
        </Card>

        {/* Stat 4: Médicos Activos */}
        <Card className="relative overflow-hidden border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cuerpo Médico
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-emerald-800" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-brand-900 font-heading">
              {doctors.length}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Especialistas</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Horarios y turnos sincronizados</p>
        </Card>
      </div>

      {/* Voice Assistant Interactive Callout Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-medical-slate text-white shadow-xl shadow-brand-900/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-sm border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-medical-teal" />
              Tecnología de Voz en Español en Tiempo Real
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">
              Agente de Voz para Consultas y Agendamiento Automático
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Permite a los pacientes solicitar citas mediante voz natural. El agente reconoce síntomas, especialidades requeridas, propone horarios disponibles y agenda sin intervención humana.
            </p>
          </div>

          <Link href="/agent" className="shrink-0">
            <Button
              variant="accent"
              size="lg"
              leftIcon={<Mic className="w-5 h-5 text-white" />}
              className="w-full md:w-auto shadow-lg shadow-medical-teal/30"
            >
              Abrir Sala de Voz IA
            </Button>
          </Link>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-medical-teal/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Recent Appointments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-900 font-heading">Próximas Citas Médicas</h3>
            <p className="text-xs text-slate-500">Últimas citas registradas en el consultorio</p>
          </div>
          <Link href="/appointments" className="text-xs font-bold text-medical-emerald hover:underline flex items-center gap-1">
            Ver todas las citas
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Fecha y Hora</th>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Médico</th>
                  <th className="px-6 py-3.5">Motivo</th>
                  <th className="px-6 py-3.5">Origen</th>
                  <th className="px-6 py-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAppointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-900 whitespace-nowrap">
                      {appt.datetime.replace('T', ' — ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {appt.patient_name}
                      <span className="block text-[11px] font-normal text-slate-400">{appt.patient_mrn}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {appt.doctor_name}
                      <span className="block text-[11px] text-slate-400">{appt.doctor_specialty}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {appt.reason || 'Consulta regular'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SourceBadge source={appt.booked_via} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
