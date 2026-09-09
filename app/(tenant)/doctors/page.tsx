'use client';

import React, { useState, useEffect } from 'react';
import { apiGetDoctors, ApiDoctor } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Stethoscope, Clock, CheckCircle2, Award, Mic } from 'lucide-react';
import Link from 'next/link';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);

  useEffect(() => {
    apiGetDoctors().then((docs) => {
      if (docs) setDoctors(docs);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
            Cuerpo Médico y Especialistas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de médicos especialistas, licencias sanitarias y horarios de atención vinculados al Agente de Voz.
          </p>
        </div>

        <Link href="/agent">
          <Button variant="accent" size="sm" leftIcon={<Mic className="w-4 h-4 text-white" />}>
            Probar Agendamiento por Voz
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <Card key={doc.id} className="hover:border-brand-900/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-900/15 shrink-0">
                  <Stethoscope className="w-6 h-6 text-medical-teal" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-900">{doc.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-medical-mint text-medical-emerald border border-medical-teal/30 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {doc.specialty}
                  </span>
                </div>
              </div>

              {doc.license_num && (
                <p className="text-xs text-slate-500 font-mono mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  Registro Médico: {doc.license_num}
                </p>
              )}

              {doc.bio && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  {doc.bio}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Lunes a Viernes • 09:00 - 17:00
              </span>
              <span className="font-bold text-medical-emerald">Disponible</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
