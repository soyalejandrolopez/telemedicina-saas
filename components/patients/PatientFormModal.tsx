'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Phone, Mail, Droplets, AlertTriangle, Pill, Check } from 'lucide-react';
import { apiCreatePatient } from '@/lib/api/client';

export function PatientFormModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'masculino' | 'femenino' | 'otro'>('femenino');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [allergiesStr, setAllergiesStr] = useState('');
  const [medicationsStr, setMedicationsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del paciente es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const allergies = allergiesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const medications = medicationsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const patient = await apiCreatePatient({
        name: name.trim(),
        dob: dob || undefined,
        gender,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        blood_type: bloodType,
        allergies,
        medications,
        notes: notes.trim() || undefined,
      });

      if (!patient) throw new Error('Error al guardar el paciente');

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Registro de Paciente"
      subtitle="Creación de ficha médica y expediente clínico digital (MRN)."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <Input
          label="Nombre y Apellidos *"
          placeholder="Ej. Ana Victoria Santos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          leftIcon={<User className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fecha Nacimiento</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Género</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            >
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-rose-500" />
              Grupo Sanguíneo
            </label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            >
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Teléfono Móvil"
            placeholder="+34 600 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="paciente@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>

        <Input
          label="Alergias Conocidas (separadas por comas)"
          placeholder="Ej. Penicilina, Ibuprofeno, Frutos secos"
          value={allergiesStr}
          onChange={(e) => setAllergiesStr(e.target.value)}
          leftIcon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        />

        <Input
          label="Medicamentos Habituales (separados por comas)"
          placeholder="Ej. Losartán 50mg, Levotiroxina 75mcg"
          value={medicationsStr}
          onChange={(e) => setMedicationsStr(e.target.value)}
          leftIcon={<Pill className="w-4 h-4 text-medical-teal" />}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Antecedentes Clínicos / Notas
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Antecedentes médicos relevantes, preferencias del paciente..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
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
            leftIcon={<Check className="w-4 h-4" />}
          >
            Guardar Ficha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
