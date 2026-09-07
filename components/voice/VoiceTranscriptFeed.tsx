'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage, DialogStep } from '@/lib/voice/dialogStates';
import { Activity, User, Volume2, Mic, CheckCircle2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function VoiceTranscriptFeed({
  messages,
  interimTranscript,
  isListening,
  currentStep,
}: {
  messages: ChatMessage[];
  interimTranscript?: string;
  isListening?: boolean;
  currentStep: DialogStep;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  const stepLabels: Record<DialogStep, string> = {
    IDLE: 'Listo para iniciar',
    GREETING: 'Identificando paciente',
    COLLECT_REASON: 'Consultando motivo clínico',
    COLLECT_DOCTOR: 'Asignando especialista',
    COLLECT_DATE: 'Buscando disponibilidad',
    SELECT_SLOT: 'Eligiendo turno',
    CONFIRMATION: 'Confirmando datos de cita',
    BOOKING: 'Registrando en base de datos',
    SUCCESS: '¡Cita confirmada con éxito!',
    ERROR: 'Error en la solicitud',
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200/80 p-4 overflow-hidden">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-brand-900 font-heading">
            Transcripción en Tiempo Real (Español)
          </span>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-brand-800 border border-slate-200">
          {stepLabels[currentStep] || currentStep}
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Volume2 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              Presione el micrófono para iniciar la conversación con el asistente médico.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              "Hola, quiero agendar una cita médica..."
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';

          return (
            <div
              key={msg.id}
              className={twMerge(
                'flex items-start gap-2.5 max-w-[85%]',
                isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'
              )}
            >
              <div
                className={twMerge(
                  'h-7 w-7 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs text-xs font-bold',
                  isAgent ? 'bg-brand-900' : 'bg-medical-emerald'
                )}
              >
                {isAgent ? <Activity className="w-3.5 h-3.5 text-medical-teal" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div
                className={twMerge(
                  'rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs',
                  isAgent
                    ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                    : 'bg-brand-900 text-white rounded-tr-sm'
                )}
              >
                <p>{msg.text}</p>
                <span
                  className={twMerge(
                    'block text-[10px] mt-1 opacity-60 text-right',
                    isAgent ? 'text-slate-400' : 'text-slate-200'
                  )}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Interim live speech transcript bubble */}
        {isListening && interimTranscript && (
          <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse opacity-80 animate-pulse">
            <div className="h-7 w-7 rounded-xl bg-medical-coral text-white flex items-center justify-center shrink-0">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs sm:text-sm bg-medical-coral/10 text-slate-700 border border-medical-coral/30 italic">
              {interimTranscript}...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
