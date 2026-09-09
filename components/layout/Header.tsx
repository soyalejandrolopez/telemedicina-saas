'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mic,
  Plus,
  Shield,
  Stethoscope,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Mail,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useTenant } from './TenantProvider';

export function Header({
  onNewAppointment,
}: {
  onNewAppointment?: () => void;
}) {
  const router = useRouter();
  const { name, slug } = useTenant();

  // Dropdown state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit Profile Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('Dra. Sofía Morales');
  const [profileRole, setProfileRole] = useState('Médico Director');
  const [profileEmail, setProfileEmail] = useState('admin@sanrafael.com');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('user_profile_name');
      const savedRole = localStorage.getItem('user_profile_role');
      const savedEmail = localStorage.getItem('user_profile_email');
      if (savedName) setProfileName(savedName);
      if (savedRole) setProfileRole(savedRole);
      if (savedEmail) setProfileEmail(savedEmail);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile_name', profileName);
      localStorage.setItem('user_profile_role', profileRole);
      localStorage.setItem('user_profile_email', profileEmail);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 900);
  };

  const handleLogout = () => {
    // Clear auth/tenant session cookies
    document.cookie = 'tenant_slug=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'authjs.session-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = '__Secure-authjs.session-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsMenuOpen(false);
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-brand-800 border border-sky-200/60">
            <Shield className="w-3.5 h-3.5 text-medical-teal" />
            <span>SaaS Multi-Tenant Cloudflare D1</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">
            Workspace: <strong className="text-slate-700">{name}</strong> ({slug})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Voice Booking CTA */}
          <Link href="/agent">
            <Button
              size="sm"
              variant="accent"
              leftIcon={<Mic className="w-3.5 h-3.5 text-white" />}
            >
              Hablar con Agente IA
            </Button>
          </Link>

          {onNewAppointment && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={onNewAppointment}
            >
              Nueva Cita
            </Button>
          )}

          {/* Admin User Profile with Dropdown */}
          <div className="relative pl-3 border-l border-slate-200" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <div className="h-8 w-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Stethoscope className="w-4 h-4 text-medical-teal" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  {profileName}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{profileRole}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{profileName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{profileEmail}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-medical-emerald bg-medical-mint px-2 py-0.5 rounded-md mt-1 border border-medical-teal/30">
                    <Building2 className="w-3 h-3" />
                    {name}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Editar Perfil
                  </button>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Configuración de Clínica
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Editar Perfil */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Editar Perfil del Administrador"
        subtitle="Actualice los datos del médico o administrador del consultorio"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Perfil actualizado exitosamente.
            </div>
          )}

          <Input
            label="Nombre Completo"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
            placeholder="Ej. Dra. Sofía Morales"
          />

          <Input
            label="Cargo o Especialidad"
            value={profileRole}
            onChange={(e) => setProfileRole(e.target.value)}
            required
            placeholder="Ej. Médico Director / Pediatra"
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            required
            placeholder="admin@clinica.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProfileModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
