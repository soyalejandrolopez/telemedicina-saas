'use client';



import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@sanrafael.com');
  const [password, setPassword] = useState('admin1234');
  const [tenantSlug, setTenantSlug] = useState('demo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate or execute auth login
      document.cookie = `tenant_slug=${tenantSlug}; path=/; max-age=86400`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('admin@sanrafael.com');
    setPassword('admin1234');
    setTenantSlug('demo');
    document.cookie = 'tenant_slug=demo; path=/; max-age=86400';
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
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
            Acceso a Consultorio Médico
          </h1>
          <p className="text-xs text-slate-500">
            Inicie sesión con sus credenciales médicas para acceder a su workspace
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
              label="Subdominio o Identificador de Clínica"
              placeholder="demo o nombre-clinica"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              required
              helper="Ej. clinica-san-rafael"
            />

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="doctor@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Contraseña de Acceso"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Ingresar al Panel
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-medical-emerald bg-medical-mint hover:bg-emerald-100/60 border border-medical-teal/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-medical-teal" />
              Acceso Rápido con Clínica Demo ("San Rafael")
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          ¿Desea registrar una nueva clínica médica?{' '}
          <Link href="/register" className="font-bold text-brand-900 hover:underline">
            Crear Nueva Clínica
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
