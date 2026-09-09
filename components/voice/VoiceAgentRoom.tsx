'use client';



import React, { useState } from 'react';
import { useVoiceDialog } from './useVoiceDialog';
import { VoiceWaveVisualizer } from './VoiceWaveVisualizer';
import { VoiceTranscriptFeed } from './VoiceTranscriptFeed';
import { Doctor } from '@/lib/db/schema';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Send,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Radio,
  Sliders,
  Play,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function VoiceAgentRoom({
  doctors,
  tenantSlug = 'demo',
}: {
  doctors: Doctor[];
  tenantSlug?: string;
}) {
  const [typedText, setTypedText] = useState('');
  const [lastBookedAppt, setLastBookedAppt] = useState<any>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const {
    step,
    context,
    messages,
    isListening,
    isSpeaking,
    interimTranscript,
    isSupported,
    error,
    hasPermission,
    startConversation,
    startListening,
    stopListening,
    sendManualText,
    availableVoices,
    selectedVoice,
    selectVoiceByName,
    rate,
    setRate,
    previewVoice,
  } = useVoiceDialog({
    doctors: doctors.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty })),
    tenantSlug,
    onAppointmentBooked: (appt) => {
      setLastBookedAppt(appt);
    },
  });

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    sendManualText(typedText.trim());
    setTypedText('');
  };

  const handleMicClick = async () => {
    if (step === 'IDLE') {
      await startConversation();
    } else if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const quickPrompts = [
    'Hola, me llamo María Fernández',
    'Tengo dolor de cabeza y fatiga',
    'Con la Dra. Sofía Morales',
    'Para mañana por favor',
    'Sí, confirmo la cita',
    'Hasta luego, adiós',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
      {/* Left Column: Interactive Voice Station (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
        <Card className="flex-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-sky-50/30 border-slate-200/80">
          <div>
            {/* Header / State indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-md shadow-brand-900/15">
                  <Sparkles className="w-5 h-5 text-medical-teal" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-brand-900 font-heading">
                    Agente de Voz IA Sanitario
                  </h2>
                  <p className="text-xs text-slate-500">
                    Atención Médica por Voz en Español • Web Speech API
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Settings Toggle */}
                <button
                  type="button"
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className={twMerge(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                    showVoiceSettings
                      ? 'bg-brand-900 text-white border-brand-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  )}
                  title="Cambiar tono o voz"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustes de Voz</span>
                </button>

                {/* Status Pill */}
                <div
                  className={twMerge(
                    'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                    isListening
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse'
                      : isSpeaking
                      ? 'bg-teal-50 text-teal-700 border-teal-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}
                >
                  <Radio className={twMerge('w-3 h-3', isListening ? 'text-emerald-600 animate-ping' : 'text-slate-400')} />
                  <span>
                    {isListening
                      ? 'Micrófono Abierto'
                      : isSpeaking
                      ? 'Agente Hablando'
                      : 'Micrófono en Pausa'}
                  </span>
                </div>

                {step !== 'IDLE' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={startConversation}
                    title="Reiniciar diálogo"
                  >
                    Reiniciar
                  </Button>
                )}
              </div>
            </div>

            {/* Voice Customization Settings Drawer */}
            {showVoiceSettings && (
              <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-medical-teal" />
                    Selección de Voz Sintetizada y Naturalidad
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {availableVoices.length} voces en español detectadas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Voice Select */}
                  <div className="sm:col-span-8">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Voz del Asistente (Priorizadas las más naturales):
                    </label>
                    <select
                      value={selectedVoice?.name || ''}
                      onChange={(e) => selectVoiceByName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                    >
                      {availableVoices.map((v) => {
                        const isNatural =
                          v.name.toLowerCase().includes('natural') ||
                          v.name.toLowerCase().includes('neural') ||
                          v.name.toLowerCase().includes('enhanced') ||
                          v.name.toLowerCase().includes('google') ||
                          v.name.toLowerCase().includes('microsoft');
                        return (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang}) {isNatural ? '★ Natural / Neuronal' : ''}
                          </option>
                        );
                      })}
                      {availableVoices.length === 0 && (
                        <option value="">Voz del sistema por defecto (es-ES)</option>
                      )}
                    </select>
                  </div>

                  {/* Cadence / Rate */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ritmo / Cadencia:
                    </label>
                    <select
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20"
                    >
                      <option value={0.92}>0.92x (Pausada y Cálida)</option>
                      <option value={0.96}>0.96x (Natural recomendada)</option>
                      <option value={1.0}>1.00x (Estándar)</option>
                      <option value={1.05}>1.05x (Dinámica)</option>
                    </select>
                  </div>
                </div>

                {/* Preview sample button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500">
                    Sugerencia: En <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>, las voces marcadas con ★ ofrecen dicción humana hiperrealista.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    leftIcon={<Play className="w-3.5 h-3.5 text-medical-teal" />}
                    onClick={() => previewVoice()}
                  >
                    Escuchar Muestra
                  </Button>
                </div>
              </div>
            )}

            {/* Error / Permission Banner */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  {hasPermission === false && (
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      Haz clic en el icono del candado en la barra del navegador y cambia el permiso del micrófono a "Permitir", luego recarga la página.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Main Interactive Mic Centerpiece */}
            <div className="py-10 flex flex-col items-center justify-center text-center">
              {/* Pulsing visual circles */}
              <div className="relative mb-6">
                <div
                  className={twMerge(
                    'absolute -inset-4 rounded-full opacity-30 transition-all duration-700 blur-xl',
                    isSpeaking
                      ? 'bg-medical-teal scale-125 animate-pulse'
                      : isListening
                      ? 'bg-emerald-500 scale-125 animate-ping'
                      : 'bg-slate-200 scale-100'
                  )}
                />

                <button
                  type="button"
                  id="voice-mic-button"
                  onClick={handleMicClick}
                  aria-label={isListening ? 'Detener micrófono' : 'Activar micrófono'}
                  className={twMerge(
                    'relative h-28 w-28 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all transform active:scale-95 focus:outline-none focus:ring-4 cursor-pointer',
                    isSpeaking
                      ? 'bg-gradient-to-tr from-medical-emerald to-medical-teal ring-medical-teal/40 animate-pulse'
                      : isListening
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-emerald-400/50 shadow-emerald-500/30 ring-4'
                      : 'bg-gradient-to-tr from-brand-900 to-brand-700 ring-brand-900/30 hover:shadow-brand-900/30 hover:scale-105'
                  )}
                >
                  {isSpeaking ? (
                    <>
                      <Volume2 className="w-10 h-10 animate-bounce" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Hablando</span>
                    </>
                  ) : isListening ? (
                    <>
                      <Mic className="w-10 h-10 animate-pulse text-white" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Escuchando</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 opacity-90" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">
                        {step === 'IDLE' ? 'Iniciar' : 'Hablar'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Message */}
              <h3 className="text-base font-extrabold text-brand-900 font-heading">
                {isSpeaking
                  ? 'El Asistente está hablando...'
                  : isListening
                  ? '🟢 Te estamos escuchando... habla con normalidad'
                  : step === 'IDLE'
                  ? 'Presiona el botón para iniciar la conversación por voz'
                  : 'Micrófono en pausa. Presiona para continuar hablando'}
              </h3>

              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {isListening
                  ? 'El agente procesará lo que digas y te responderá en audio.'
                  : step === 'IDLE'
                  ? 'El navegador te solicitará permiso de micrófono para conversar en tiempo real.'
                  : 'Presiona el micrófono o utiliza las respuestas sugeridas a continuación.'}
              </p>

              {/* Live interim speech bubble directly under mic with reserved height to prevent vertical jitter */}
              <div className="min-h-[36px] mt-2 flex items-center justify-center">
                {isListening && interimTranscript ? (
                  <div className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-pulse max-w-md truncate">
                    Detectando: "{interimTranscript}..."
                  </div>
                ) : null}
              </div>

              {/* Acoustic Wave Animation */}
              <VoiceWaveVisualizer
                isListening={isListening}
                isSpeaking={isSpeaking}
                className="mt-6"
              />
            </div>
          </div>

          {/* Quick Phrase Prompts & Text Fallback Input */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            {/* Quick suggested chips */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Respuestas Rápidas Sugeridas (haz clic para simular tu voz):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendManualText(prompt)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-brand-900/40 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Manual text input fallback */}
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <Input
                placeholder="Escribe tu respuesta aquí si prefieres no hablar por micrófono..."
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" size="md" variant="primary" leftIcon={<Send className="w-3.5 h-3.5" />}>
                Enviar
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Right Column: Live Transcript & Extracted Medical Data (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        {/* Extracted Slot / Appointment Preview Card */}
        <Card className="border-teal-100 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-medical-emerald flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-medical-teal" />
              Ficha en Tiempo Real de la Cita
            </span>
            {step === 'SUCCESS' && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Agendada
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Paciente</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <User className="w-3 h-3 text-medical-teal shrink-0" />
                {context.patientName || 'Por identificar...'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Médico Asignado</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <Stethoscope className="w-3 h-3 text-medical-teal shrink-0" />
                {context.doctorName || 'Por seleccionar...'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha Solicitada</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <Calendar className="w-3 h-3 text-medical-teal shrink-0" />
                {context.dateDisplay || context.dateStr || 'Pendiente...'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Horario</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <Clock className="w-3 h-3 text-medical-teal shrink-0" />
                {context.slotTime || 'Pendiente...'}
              </span>
            </div>
          </div>

          {context.reason && (
            <p className="mt-2 text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200/80">
              <strong className="text-slate-700">Síntoma / Motivo:</strong> {context.reason}
            </p>
          )}
        </Card>

        {/* Live Conversation Transcript Feed */}
        <div className="flex-1 min-h-[420px] max-h-[480px] flex flex-col">
          <VoiceTranscriptFeed
            messages={messages}
            interimTranscript={interimTranscript}
            isListening={isListening}
            currentStep={step}
          />
        </div>
      </div>
    </div>
  );
}
