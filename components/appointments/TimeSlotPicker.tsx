'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface Slot {
  time: string;
  datetime: string;
  available: boolean;
}

export function TimeSlotPicker({
  slots,
  selectedDatetime,
  onSelectSlot,
  isLoading = false,
}: {
  slots: Slot[];
  selectedDatetime?: string;
  onSelectSlot: (slot: Slot) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
        <Clock className="w-5 h-5 animate-spin text-medical-teal" />
        <p className="text-xs">Consultando disponibilidad de horarios...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <p className="text-xs font-medium text-slate-500">
          No hay turnos disponibles para esta fecha con el médico seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Turnos Disponibles ({slots.filter((s) => s.available).length} libres)
        </label>
        <span className="text-[11px] text-slate-400">Duración: 30 min</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
        {slots.map((slot) => {
          const isSelected = selectedDatetime === slot.datetime;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.datetime}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectSlot(slot)}
              className={twMerge(
                'px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border text-center',
                !isAvailable
                  ? 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-brand-900 text-white border-brand-900 shadow-sm shadow-brand-900/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-brand-900/40 hover:bg-slate-50'
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
