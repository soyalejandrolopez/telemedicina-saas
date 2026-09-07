'use client';



import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Building2, Mail, Lock, User, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterClinicPage() {
  const router = useRouter();
  const [clinicName, setClinicName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [plan, setPlan] = useState<'pro' | 'enterprise'>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClinicNameChange = (val: string) => {
    setClinicName(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clinicName.trim(),
          slug: slug.trim(),
          adminEmail: adminEmail.trim(),
          adminPassword,
          adminName: adminName.trim(),
          plan,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar la clínica');

      // Set cookie and redirect to new tenant dashboard
      document.cookie = `tenant_slug=${slug.trim()}; path=/; max-age=86400`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Branding Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
              <Activity className="h-6 w-6 text-medical-teal" />
            </div>
            <span className="text-2xl font-bold font-heading text-brand-900 tracking-tight">
              MediSchedule
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 font-heading">
            Registrar Nueva Clínica o Consultorio
          </h1>
          <p className="text-xs text-slate-500">
            Habilite su espacio SaaS aislado con base de datos Cloudflare D1 y Agente de Voz IA
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de la Clínica o Centro Médico *"
              placeholder="Ej. Centro Médico Las Palmas"
              value={clinicName}
              onChange={(e) => handleClinicNameChange(e.target.value)}
              required
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subdominio Asignado *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="las-palmas"
                  required
                  className="block w-full rounded-l-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                />
                <span className="inline-flex items-center px-3 py-2.5 rounded-r-xl border border-l-0 border-slate-300 bg-slate-50 text-xs text-slate-500 font-mono">
                  .medischedule.com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre del Director / Admin *"
                placeholder="Dr. Fernando Reyes"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Correo Administrativo *"
                type="email"
                placeholder="admin@laspalmas.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Contraseña de Seguridad *"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Crear Clínica y Desplegar Workspace
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          ¿Ya tiene una clínica registrada?{' '}
          <Link href="/login" className="font-bold text-brand-900 hover:underline">
            Iniciar Sesión
          </Link>
        </p>

        {/* Hamster Software Attribution */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <img
            src="/hamster-software.jpg"
            alt="Hamster Software"
            className="w-4 h-4 rounded-full object-cover border border-slate-300"
          />
          <span className="text-[11px] text-slate-400">
            Desarrollado por <strong className="text-slate-600 font-semibold">Hamster Software</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
