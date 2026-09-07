'use client';



import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Calendar,
  Users,
  Mic,
  UserCheck,
  Building2,
  LayoutDashboard,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useTenant } from './TenantProvider';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Citas & Calendario',
    href: '/appointments',
    icon: Calendar,
  },
  {
    name: 'Directorio Pacientes',
    href: '/patients',
    icon: Users,
  },
  {
    name: 'Agente de Voz IA',
    href: '/agent',
    icon: Mic,
    badge: 'En vivo',
  },
  {
    name: 'Plantel Médico',
    href: '/doctors',
    icon: UserCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { name, subdomain } = useTenant();

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Clinic Identity */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-md shadow-brand-900/20">
              <Activity className="h-5 w-5 text-medical-teal" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-brand-900 truncate font-heading">{name}</h2>
              <p className="text-xs text-slate-500 truncate">{subdomain}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-brand-900 text-white shadow-sm shadow-brand-900/15'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={twMerge(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-medical-teal' : 'text-slate-400 group-hover:text-brand-900'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={twMerge(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                      isActive
                        ? 'bg-medical-teal text-white'
                        : 'bg-medical-mint text-medical-emerald border border-medical-teal/30'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Voice Assistant Promo Card at bottom of sidebar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-brand-900 font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-medical-teal animate-pulse" />
            Agente de Voz Activo
          </div>
          <p className="text-[11px] text-slate-500 leading-tight mb-2.5">
            Los pacientes pueden llamar o usar la interfaz web para agendar en lenguaje natural.
          </p>
          <Link
            href="/agent"
            className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg bg-medical-mint text-medical-emerald border border-medical-teal/30 hover:bg-emerald-100/60 transition-colors"
          >
            Abrir Sala de Voz
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Hamster Software Attribution */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-center gap-2">
          <img
            src="/hamster-software.jpg"
            alt="Hamster Software"
            className="w-5 h-5 rounded-full object-cover border border-slate-300 shadow-2xs"
          />
          <span className="text-[10px] text-slate-500 font-medium">
            Desarrollado por <strong className="text-brand-900 font-semibold">Hamster Software</strong>
          </span>
        </div>
      </div>
    </aside>
  );
}
