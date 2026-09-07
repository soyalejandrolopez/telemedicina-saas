import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AppointmentStatus, BookedVia } from '@/lib/db/schema';
import { Mic, Globe, UserCheck, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const configs: Record<AppointmentStatus, { label: string; className: string; icon: React.ReactNode }> = {
    confirmed: {
      label: 'Confirmada',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    completed: {
      label: 'Atendida',
      className: 'bg-blue-50 text-blue-700 border-blue-200/80',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    cancelled: {
      label: 'Cancelada',
      className: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    no_show: {
      label: 'No asistió',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
  };

  const c = configs[status] || configs.pending;

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        c.className
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

export function SourceBadge({ source }: { source?: BookedVia }) {
  if (source === 'voice_agent') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-medical-mint text-medical-emerald border border-medical-teal/30">
        <Mic className="w-3 h-3 text-medical-teal" />
        Voz IA
      </span>
    );
  }

  if (source === 'online') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        <Globe className="w-3 h-3" />
        Portal Web
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      Recepción
    </span>
  );
}
