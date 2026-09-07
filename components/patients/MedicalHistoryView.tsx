'use client';

import React, { useState } from 'react';
import { Patient, MedicalRecord } from '@/lib/db/schema';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  Heart,
  Pill,
  FileCheck,
  Calendar,
  AlertTriangle,
  Stethoscope,
  Clock,
  Plus,
} from 'lucide-react';

export function MedicalHistoryView({
  patient,
  records = [],
  onAddRecord,
}: {
  patient: Patient;
  records?: MedicalRecord[];
  onAddRecord?: () => void;
}) {
  const parseJson = (val?: string | null, fallback: any = []) => {
    if (!val) return fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const allergies = parseJson(patient.allergies, []);
  const medications = parseJson(patient.medications, []);

  // Most recent vital signs if available
  const latestVitalSigns = records.length > 0 ? parseJson(records[0].vital_signs, {}) : {};

  return (
    <div className="space-y-6">
      {/* Vitals Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Presión Arterial</p>
            <p className="text-base font-extrabold text-slate-800 font-heading">
              {latestVitalSigns.ta || '120/80 mmHg'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Frecuencia Cardíaca</p>
            <p className="text-base font-extrabold text-slate-800 font-heading">
              {latestVitalSigns.fc || '72 lpm'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saturación O2</p>
            <p className="text-base font-extrabold text-slate-800 font-heading">
              {latestVitalSigns.sat || '99%'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Grupo / Factor</p>
            <p className="text-base font-extrabold text-slate-800 font-heading">
              {patient.blood_type || 'O+'}
            </p>
          </div>
        </div>
      </div>

      {/* Allergies & Current Medications Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-rose-100 bg-rose-50/20">
          <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Alergias Conocidas y Advertencias
          </div>
          {allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allergies.map((a: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-1">El paciente no refiere alergias medicamentosas o alimentarias.</p>
          )}
        </Card>

        <Card className="border-teal-100 bg-emerald-50/10">
          <div className="flex items-center gap-2 mb-2 text-brand-900 font-bold text-sm">
            <Pill className="w-4 h-4 text-medical-teal" />
            Tratamientos y Medicamentos Activos
          </div>
          {medications.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {medications.map((m: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-1">Sin medicamentos de toma crónica registrados.</p>
          )}
        </Card>
      </div>

      {/* Clinical Notes & Consultations Timeline */}
      <Card>
        <CardHeader
          title="Evolución Clínica y Consultas Médicas"
          subtitle={`Historial cronológico de atenciones para el expediente ${patient.mrn}`}
        />

        {records.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs">No hay notas de evolución previas registradas para este paciente.</p>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {records.map((rec) => {
              const prescriptions = parseJson(rec.prescriptions, []);

              return (
                <div key={rec.id} className="relative pl-6 border-l-2 border-medical-teal/40 space-y-2">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-medical-teal border-2 border-white shadow-xs" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-medical-teal" />
                      {new Date(rec.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Diagnóstico Médico
                      </h4>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{rec.diagnosis}</p>
                    </div>

                    {rec.treatment && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Plan Terapéutico
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{rec.treatment}</p>
                      </div>
                    )}

                    {prescriptions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Prescripciones
                        </h4>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                          {prescriptions.map((rx: string, idx: number) => (
                            <li key={idx}>{rx}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
