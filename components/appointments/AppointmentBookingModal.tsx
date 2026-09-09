'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TimeSlotPicker, Slot } from './TimeSlotPicker';
import { Doctor, Patient } from '@/lib/db/schema';
import { Calendar, User, Stethoscope, FileText, Check } from 'lucide-react';
import { apiGetDoctors, apiGetPatients, apiGetSlots, apiCreateAppointment } from '@/lib/api/client';

export function AppointmentBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('new');
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientPhone, setNewPatientPhone] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors and patients on open
  useEffect(() => {
    if (!isOpen) return;

    apiGetDoctors().then((docs) => {
      if (docs && docs.length > 0) {
        setDoctors(docs as Doctor[]);
        setSelectedDoctorId(docs[0].id);
      }
    });

    apiGetPatients().then((pats) => {
      if (pats) {
        setPatients(pats as Patient[]);
      }
    });
  }, [isOpen]);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    setIsLoadingSlots(true);
    setSelectedSlot(null);

    apiGetSlots(selectedDoctorId, selectedDate)
      .then((returnedSlots) => {
        setSlots(returnedSlots);
        setIsLoadingSlots(false);
      })
      .catch(() => {
        setIsLoadingSlots(false);
      });
  }, [selectedDoctorId, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Por favor selecciona un horario disponible.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        doctor_id: selectedDoctorId,
        datetime: selectedSlot.datetime,
        reason: reason || 'Consulta general',
        booked_via: 'manual',
      };

      if (selectedPatientId === 'new') {
        if (!newPatientName.trim()) {
          setError('Ingresa el nombre del paciente.');
          setIsSubmitting(false);
          return;
        }
        payload.patient_name = newPatientName.trim();
        payload.patient_phone = newPatientPhone.trim() || undefined;
      } else {
        payload.patient_id = selectedPatientId;
      }

      await apiCreateAppointment(payload);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la cita');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Nueva Cita Médica"
      subtitle="Programación directa con detección de conflictos y asignación de slot."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Doctor Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-medical-teal" />
            Médico / Especialidad
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Patient Selection: Existing or New */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-medical-teal" />
            Paciente
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 mb-2"
          >
            <option value="new">+ Registrar nuevo paciente al vuelo</option>
            {patients.map((pat) => (
              <option key={pat.id} value={pat.id}>
                {pat.name} ({pat.mrn})
              </option>
            ))}
          </select>

          {selectedPatientId === 'new' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <Input
                label="Nombre y Apellidos *"
                placeholder="Ej. Carmen Salinas"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                required
              />
              <Input
                label="Teléfono Móvil"
                placeholder="+34 600 000 000"
                value={newPatientPhone}
                onChange={(e) => setNewPatientPhone(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-medical-teal" />
            Fecha de la Cita
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
          />
        </div>

        {/* Slots Picker */}
        <TimeSlotPicker
          slots={slots}
          selectedDatetime={selectedSlot?.datetime}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          isLoading={isLoadingSlots}
        />

        {/* Reason / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-medical-teal" />
            Motivo de Consulta
          </label>
          <Input
            placeholder="Ej. Chequeo anual, dolor muscular, renovación de receta..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!selectedSlot}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Confirmar y Agendar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
