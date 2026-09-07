'use client';

import React, { useState } from 'react';
import { AppointmentWithDetails } from '@/lib/db/queries/appointments';
import { Doctor } from '@/lib/db/schema';
import { StatusBadge, SourceBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Filter,
  Plus,
  Mic,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export function AppointmentCalendar({
  appointments,
  doctors,
  onStatusChange,
  onOpenBooking,
}: {
  appointments: AppointmentWithDetails[];
  doctors: Doctor[];
  onStatusChange?: (id: string, status: string) => void;
  onOpenBooking: () => void;
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const filteredAppointments = appointments.filter((appt) => {
    if (selectedDoctorId !== 'all' && appt.doctor_id !== selectedDoctorId) return false;
    if (selectedStatus !== 'all' && appt.status !== selectedStatus) return false;
    if (selectedDate && !appt.datetime.startsWith(selectedDate)) return false;
    return true;
  });

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return iso.split('T')[1]?.substring(0, 5) || iso;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return iso.split('T')[0];
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Doctor filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            >
              <option value="all">Todos los Médicos ({doctors.length})</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatus === st
                    ? 'bg-white text-brand-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'all'
                  ? 'Todas'
                  : st === 'confirmed'
                  ? 'Confirmadas'
                  : st === 'completed'
                  ? 'Atendidas'
                  : 'Canceladas'}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/agent">
            <Button size="sm" variant="accent" leftIcon={<Mic className="w-4 h-4 text-white" />}>
              Agendar con Voz IA
            </Button>
          </Link>
          <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={onOpenBooking}>
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Appointment Cards List */}
      {filteredAppointments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 mb-1">No hay citas en esta vista</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            No se encontraron citas con los filtros seleccionados. Puedes agendar una cita manual o probar el agente de voz.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" variant="secondary" onClick={onOpenBooking}>
              Agendar Cita Manual
            </Button>
            <Link href="/agent">
              <Button size="sm" variant="accent" leftIcon={<Mic className="w-4 h-4" />}>
                Usar Agente de Voz
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((appt) => (
            <Card
              key={appt.id}
              className="hover:border-brand-900/30 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Time & Badges */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-brand-900 font-heading">
                      {formatTime(appt.datetime)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 capitalize">
                      {formatDate(appt.datetime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SourceBadge source={appt.booked_via} />
                    <StatusBadge status={appt.status} />
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-medical-teal shrink-0" />
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {appt.patient_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {appt.doctor_name} • <strong className="text-slate-600">{appt.doctor_specialty}</strong>
                    </span>
                  </div>
                  {appt.reason && (
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mt-2 leading-relaxed">
                      <strong className="text-slate-700">Motivo:</strong> {appt.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => onStatusChange && onStatusChange(appt.id, 'completed')}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="Marcar como atendida"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Atendida
                    </button>
                    <button
                      onClick={() => onStatusChange && onStatusChange(appt.id, 'cancelled')}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Cancelar cita"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
