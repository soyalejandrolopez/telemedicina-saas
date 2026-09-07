'use client';



import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MedicalHistoryView } from '@/components/patients/MedicalHistoryView';
import { Patient, MedicalRecord } from '@/lib/db/schema';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  Mic,
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [patient, setPatient] = useState<(Patient & { records?: MedicalRecord[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/patients/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPatient(data.patient || null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-medical-teal" />
        <p className="text-xs font-medium">Cargando expediente médico del paciente...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Paciente no encontrado</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">El identificador solicitado no existe en esta clínica.</p>
        <Link href="/patients">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver al Directorio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/patients"
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-brand-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-brand-900 font-heading">
                {patient.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-50 text-brand-900 border border-brand-200/60">
                {patient.mrn}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Expediente Clínico Digital • Registrado:{' '}
              {new Date(patient.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/agent">
            <Button size="sm" variant="accent" leftIcon={<Mic className="w-4 h-4" />}>
              Agendar con Voz
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Profile Card */}
      <Card className="bg-gradient-to-r from-white via-white to-sky-50/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Fecha Nacimiento</span>
            <span className="text-slate-800 font-bold mt-0.5 block">
              {patient.dob || 'No registrada'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Teléfono de Contacto</span>
            <span className="text-slate-800 font-bold mt-0.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-medical-teal" />
              {patient.phone || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Correo Electrónico</span>
            <span className="text-slate-800 font-bold mt-0.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {patient.email || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Dirección de Residencia</span>
            <span className="text-slate-800 font-bold mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {patient.address || '—'}
            </span>
          </div>
        </div>

        {patient.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <strong className="text-slate-700">Notas de Antecedentes:</strong> {patient.notes}
          </div>
        )}
      </Card>

      {/* EHR & Medical History Timeline */}
      <MedicalHistoryView patient={patient} records={patient.records} />
    </div>
  );
}
