'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, Plus, Bell, Shield, Stethoscope, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTenant } from './TenantProvider';

export function Header({
  onNewAppointment,
}: {
  onNewAppointment?: () => void;
}) {
  const { name, slug } = useTenant();

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-brand-800 border border-sky-200/60">
          <Shield className="w-3.5 h-3.5 text-medical-teal" />
          <span>SaaS Multi-Tenant Cloudflare D1</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-xs text-slate-500 font-medium">
          Workspace: <strong className="text-slate-700">{name}</strong> ({slug})
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Voice Booking CTA */}
        <Link href="/agent">
          <Button
            size="sm"
            variant="accent"
            leftIcon={<Mic className="w-3.5 h-3.5 text-white" />}
          >
            Hablar con Agente IA
          </Button>
        </Link>

        {onNewAppointment && (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={onNewAppointment}
          >
            Nueva Cita
          </Button>
        )}

        {/* Doctor / User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Stethoscope className="w-4 h-4 text-medical-teal" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Dra. Sofía Morales</p>
            <p className="text-[10px] text-slate-500 font-medium">Médico Director</p>
          </div>
        </div>
      </div>
    </header>
  );
}
