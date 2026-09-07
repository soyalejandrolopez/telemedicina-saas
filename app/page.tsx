/*!
██╗  ██╗ █████╗ ███╗   ███╗███████╗████████╗███████╗██████╗     ███████╗ ██████╗ ███████╗████████╗██╗    ██╗ █████╗ ██████╗ ███████╗
██║  ██║██╔══██╗████╗ ████║██╔════╝╚══██╔══╝██╔════╝██╔══██╗    ██╔════╝██╔═══██╗██╔════╝╚══██╔══╝██║    ██║██╔══██╗██╔══██╗██╔════╝
███████║███████║██╔████╔██║███████╗   ██║   █████╗  ██████╔╝    ███████╗██║   ██║█████╗     ██║   ██║ █╗ ██║███████║██████╔╝█████╗  
██╔══██║██╔══██║██║╚██╔╝██║╚════██║   ██║   ██╔══╝  ██╔══██╗    ╚════██║██║   ██║██╔══╝     ██║   ██║███╗██║██╔══██║██╔══██╗██╔══╝  
██║  ██║██║  ██║██║ ╚═╝ ██║███████║   ██║   ███████╗██║  ██║    ███████║╚██████╔╝██║        ██║   ╚███╔███╔╝██║  ██║██║  ██║███████╗
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚══════╝ ╚═════╝ ╚═╝        ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
*/

import Link from "next/link";
import {
  Mic,
  Calendar,
  Users,
  Shield,
  ArrowRight,
  Activity,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Clock,
  HeartPulse,
} from "lucide-react";
import { getTenantBySlug } from "@/lib/db/queries/tenants";
import { listDoctors } from "@/lib/db/queries/doctors";
import { VoiceAgentRoom } from "@/components/voice/VoiceAgentRoom";

export default async function HomePage() {
  const tenant = getTenantBySlug("demo");
  const doctors = tenant ? listDoctors(tenant.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/40 selection:bg-medical-teal selection:text-white">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-md shadow-brand-900/20">
              <Activity className="h-6 w-6 text-medical-teal" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading text-brand-900 tracking-tight">
                MediSchedule
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-medical-mint text-medical-emerald border border-medical-teal/30">
                SaaS de Voz IA
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#demo-agente" className="hover:text-brand-900 transition-colors flex items-center gap-1.5 font-semibold text-brand-900">
              <Mic className="w-4 h-4 text-medical-coral" />
              Probar Agente en Vivo
            </a>
            <a href="#caracteristicas" className="hover:text-brand-900 transition-colors">
              Características
            </a>
            <a href="#especialistas" className="hover:text-brand-900 transition-colors">
              Especialistas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-brand-900 transition-colors px-3 py-1.5"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-900 text-white text-sm font-semibold hover:bg-brand-950 transition-all shadow-sm shadow-brand-900/20"
            >
              Panel Clínico
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-brand-900 text-xs font-semibold shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-medical-teal" />
              Agente de Voz IA Sanitario en Tiempo Real • Demo Abierta para Invitados
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs">
              <img
                src="/hamster-software.jpg"
                alt="Hamster Software"
                className="h-4 w-4 rounded-full object-cover border border-slate-300"
              />
              Desarrollado por <strong className="text-brand-900 font-semibold">Hamster Software</strong>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none font-heading">
            Agende sus citas médicas <br className="hidden sm:inline" />
            <span className="text-medical-teal">hablando naturalmente</span> con nuestro Agente IA
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Sin formularios interminables ni esperas telefónicas. Cualquier paciente puede interactuar
            por voz en español, consultar disponibilidad de especialistas y agendar en segundos.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo-agente"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-medical-emerald to-medical-teal text-white font-semibold text-base hover:opacity-95 transition-all shadow-lg shadow-medical-teal/25 cursor-pointer"
            >
              <Mic className="h-5 w-5 text-white animate-pulse" />
              Hablar con el Asistente Ahora (Gratis)
            </a>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-brand-900 font-semibold text-base hover:bg-slate-50 transition-all shadow-xs"
            >
              <Calendar className="h-5 w-5 text-brand-900" />
              Ver Panel Médico SaaS
            </Link>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 font-medium border-t border-slate-100 pt-6">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-medical-teal" />
              Sin registro previo como invitado
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-medical-teal" />
              Web Speech API nativa en español
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-medical-teal" />
              Aislamiento Multi-Tenant Cloudflare D1
            </span>
          </div>
        </section>

        {/* Interactive Live Voice Agent Sandbox (for Guests) */}
        <section
          id="demo-agente"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20"
        >
          <div className="p-1 rounded-3xl bg-gradient-to-tr from-brand-900 via-teal-700 to-medical-teal shadow-2xl">
            <div className="bg-slate-50 rounded-[22px] p-6 sm:p-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/80">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Sala de Voz Activa para Pacientes e Invitados
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-900 font-heading">
                    Interactúa en Vivo con el Agente de Voz
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                    Prueba el flujo completo: presiona el micrófono, dile tu nombre, síntoma o el
                    especialista con el que deseas agendar. El asistente te escuchará y responderá por audio.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600">
                    <p className="font-bold text-brand-900">Clínica de Demostración:</p>
                    <p className="text-slate-500">Clínica San Rafael • 3 Especialistas</p>
                  </div>
                </div>
              </div>

              {/* Live Voice Agent Component */}
              <VoiceAgentRoom doctors={doctors} tenantSlug="demo" />
            </div>
          </div>
        </section>

        {/* Doctors Directory preview */}
        <section id="especialistas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-brand-900 font-heading">
              Especialistas Disponibles en la Plataforma
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              El agente de voz conoce sus agendas y turnos en tiempo real para evitar sobrecargas y conflictos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-900/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-brand-900 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                    <HeartPulse className="w-5 h-5 text-medical-teal" />
                  </div>
                  <h3 className="text-base font-bold text-brand-900">{doc.name}</h3>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-medical-mint text-medical-emerald border border-medical-teal/30 mt-1">
                    {doc.specialty}
                  </span>
                  {doc.bio && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {doc.bio}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Lun - Vie
                  </span>
                  <a
                    href="#demo-agente"
                    className="font-bold text-medical-emerald hover:underline"
                  >
                    Agendar por voz &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="caracteristicas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-brand-900 font-heading">
              Arquitectura SaaS de Grado Médico
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Diseñado para consultorios independientes, clínicas policonsultorio y redes de salud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-sky-50 text-brand-700 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-medical-teal" />
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2">Voz en Español en Tiempo Real</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sin latencia de servidores externos: opera con la Web Speech API del navegador. Reconoce intenciones, fechas relativas ("mañana", "el martes") y horas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-medical-emerald" />
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2">Cero Doble Turno</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                El motor de slots calcula turnos libres de 30 minutos y previene automáticamente sobre-reservas mediante bloqueo a nivel de base de datos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2">Multi-Tenancy Cloudflare D1</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cada consultorio posee su propio subdominio (`clinica.medischedule.com`) y base de datos relacional aislada con expedientes clínicos protegidos.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-medical-teal" />
            <span className="font-bold text-brand-900">MediSchedule SaaS</span> — Gestión Médica y Agendamiento por Voz
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-2xs">
            <img
              src="/hamster-software.jpg"
              alt="Hamster Software"
              className="h-6 w-6 rounded-full object-cover border border-slate-300"
            />
            <span className="text-slate-600 font-medium text-xs">
              Desarrollado por <strong className="text-brand-900 font-semibold">Hamster Software</strong>
            </span>
          </div>

          <p>© 2026 MediSchedule. Impulsado por Next.js, Cloudflare D1 & Web Speech API.</p>
        </div>
      </footer>
    </div>
  );
}
