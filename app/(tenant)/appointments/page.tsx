'use client';



import React, { useState, useEffect, useCallback } from 'react';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { AppointmentBookingModal } from '@/components/appointments/AppointmentBookingModal';
import { AppointmentWithDetails } from '@/lib/db/queries/appointments';
import { Doctor } from '@/lib/db/schema';
import { Loader2 } from 'lucide-react';
import { apiGetAppointments, apiGetDoctors, apiUpdateAppointmentStatus } from '@/lib/api/client';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [appts, docs] = await Promise.all([
        apiGetAppointments(),
        apiGetDoctors(),
      ]);

      setAppointments(appts as unknown as AppointmentWithDetails[]);
      setDoctors(docs as Doctor[]);
    } catch (e) {
      console.error('Error fetching appointments:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const ok = await apiUpdateAppointmentStatus(id, status);
      if (ok) {
        loadData();
      }
    } catch (e) {
      console.error('Error updating appointment:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
          Calendario y Gestión de Citas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Visualice la agenda médica, filtre por doctor, gestione estados y programe nuevas consultas.
        </p>
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-medical-teal" />
          <p className="text-xs font-medium">Cargando agenda médica...</p>
        </div>
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          doctors={doctors}
          onStatusChange={handleStatusChange}
          onOpenBooking={() => setIsBookingOpen(true)}
        />
      )}

      <AppointmentBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
