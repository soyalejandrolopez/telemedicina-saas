'use client';



import React, { useState, useEffect, useCallback } from 'react';
import { PatientList } from '@/components/patients/PatientList';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { Patient } from '@/lib/db/schema';
import { Loader2 } from 'lucide-react';
import { apiGetPatients } from '@/lib/api/client';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const pats = await apiGetPatients();
      setPatients(pats as Patient[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
          Directorio de Pacientes
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Búsqueda de fichas médicas, expedientes digitales y antecedentes clínicos.
        </p>
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-medical-teal" />
          <p className="text-xs font-medium">Cargando directorio de pacientes...</p>
        </div>
      ) : (
        <PatientList patients={patients} onNewPatient={() => setIsModalOpen(true)} />
      )}

      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPatients}
      />
    </div>
  );
}
