'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Patient } from '@/lib/db/schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Search,
  User,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  Calendar,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

export function PatientList({
  patients,
  onNewPatient,
}: {
  patients: Patient[];
  onNewPatient: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  const parseJsonArray = (val?: string | null): string[] => {
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Buscar por nombre, expediente (MRN), teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={onNewPatient}
        >
          Registrar Paciente
        </Button>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No se encontraron pacientes</h4>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? 'Prueba con otros términos de búsqueda' : 'Registra tu primer paciente en el consultorio'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Contacto</th>
                  <th className="px-6 py-3.5">Sangre</th>
                  <th className="px-6 py-3.5">Alergias Conocidas</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((patient) => {
                  const allergies = parseJsonArray(patient.allergies);

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-900 flex items-center justify-center font-bold text-xs border border-brand-200/60">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/patients/${patient.id}`}
                              className="font-bold text-brand-900 hover:text-medical-teal transition-colors"
                            >
                              {patient.name}
                            </Link>
                            <span className="block text-xs text-slate-500 font-mono">
                              {patient.mrn} • <span className="capitalize">{patient.gender || 'Sin especificar'}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.phone || '—'}</span>
                        </div>
                        {patient.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {patient.blood_type || 'Desconocido'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {allergies.map((all, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {all}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sin alergias registradas</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-medical-teal" />
                          Historia Clínica
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
