'use client';

import { useState, useCallback, useRef } from 'react';
import { DialogStep, DialogContext, ChatMessage } from '@/lib/voice/dialogStates';
import { parseSpanishVoiceInput } from '@/lib/voice/intentParser';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export function useVoiceDialog({
  doctors = [],
  tenantSlug = 'demo',
  onAppointmentBooked,
}: {
  doctors?: { id: string; name: string; specialty: string }[];
  tenantSlug?: string;
  onAppointmentBooked?: (appointment: any) => void;
}) {
  const [step, setStep] = useState<DialogStep>('IDLE');
  const [context, setContext] = useState<DialogContext>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const contextRef = useRef(context);
  contextRef.current = context;

  const stepRef = useRef(step);
  stepRef.current = step;

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    availableVoices,
    selectedVoice,
    selectVoiceByName,
    rate,
    setRate,
    previewVoice,
  } = useSpeechSynthesis();

  // Helper to append message
  const addMessage = useCallback((sender: 'agent' | 'user' | 'system', text: string, currentStep?: DialogStep) => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender,
      text,
      timestamp: new Date(),
      step: currentStep,
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  }, []);

  // Forward declaration of startListening / stopListening from recognition hook
  const startListeningRef = useRef<() => Promise<boolean>>(() => Promise.resolve(false));
  const stopListeningRef = useRef<() => void>(() => {});

  // Helper to speak agent message and resume listening
  const agentSpeak = useCallback(
    (text: string, nextStep?: DialogStep) => {
      if (nextStep) {
        setStep(nextStep);
        stepRef.current = nextStep;
      }
      addMessage('agent', text, nextStep);

      // Temporarily pause recognition while agent speaks to prevent audio feedback
      stopListeningRef.current();

      speak(text, () => {
        // Once agent finishes speaking, immediately re-open the microphone
        setTimeout(() => {
          startListeningRef.current();
        }, 200);
      });
    },
    [speak, addMessage]
  );

  // Recognition callback for user speech
  const handleUserSpeech = useCallback(
    async (rawText: string) => {
      if (!rawText.trim()) return;

      // If agent was talking, stop speaking immediately (barge-in)
      stopSpeaking();

      addMessage('user', rawText, stepRef.current);
      setIsProcessing(true);

      const parsed = parseSpanishVoiceInput(rawText, doctors);
      const curStep = stepRef.current;
      const ctx = { ...contextRef.current };

      try {
        switch (curStep) {
          case 'GREETING': {
            const name = parsed.entities.name || rawText.replace(/^(hola|buenos días|buenas tardes|soy|me llamo)\s*/iu, '').trim();
            ctx.patientName = name;
            setContext(ctx);
            contextRef.current = ctx;

            agentSpeak(
              `Mucho gusto, ${name}. ¿Cuál es el motivo o síntoma principal de su consulta médica?`,
              'COLLECT_REASON'
            );
            break;
          }

          case 'COLLECT_REASON': {
            ctx.reason = parsed.entities.reason || rawText;
            setContext(ctx);
            contextRef.current = ctx;

            const docListStr = doctors.slice(0, 2).map((d) => `${d.name} (${d.specialty})`).join(' o ');
            agentSpeak(
              `Entendido: ${ctx.reason}. ¿Tiene preferencia de médico o especialidad? Contamos con ${docListStr}.`,
              'COLLECT_DOCTOR'
            );
            break;
          }

          case 'COLLECT_DOCTOR': {
            let matchedDoc = doctors.find(
              (d) =>
                (parsed.entities.doctorName && d.name.toLowerCase().includes(parsed.entities.doctorName.toLowerCase())) ||
                (parsed.entities.specialty && d.specialty.toLowerCase() === parsed.entities.specialty.toLowerCase())
            );

            if (!matchedDoc && doctors.length > 0) {
              matchedDoc = doctors[0]; // fallback to first doctor
            }

            if (matchedDoc) {
              ctx.doctorId = matchedDoc.id;
              ctx.doctorName = matchedDoc.name;
              ctx.specialty = matchedDoc.specialty;
              setContext(ctx);
              contextRef.current = ctx;

              agentSpeak(
                `Perfecto, con ${matchedDoc.name}. ¿Para qué día prefiere su cita? Puede decir hoy, mañana o un día de la semana.`,
                'COLLECT_DATE'
              );
            } else {
              agentSpeak('¿Podría indicarme la especialidad médica o el nombre del doctor que prefiere?');
            }
            break;
          }

          case 'COLLECT_DATE': {
            let targetDate = parsed.entities.dateStr;
            let displayDate = parsed.entities.dateDisplay || targetDate;

            if (!targetDate) {
              const now = new Date();
              now.setDate(now.getDate() + 1); // default tomorrow
              const y = now.getFullYear();
              const m = (now.getMonth() + 1).toString().padStart(2, '0');
              const d = now.getDate().toString().padStart(2, '0');
              targetDate = `${y}-${m}-${d}`;
              displayDate = 'mañana';
            }

            ctx.dateStr = targetDate;
            ctx.dateDisplay = displayDate;

            // Fetch available slots from backend with robust fallback
            let availableSlots: any[] = [];
            try {
              const res = await fetch(`/api/slots?doctorId=${ctx.doctorId}&date=${targetDate}`, {
                headers: {
                  'x-tenant-slug': tenantSlug,
                },
              });

              if (res.ok) {
                const text = await res.text();
                if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                  const data = JSON.parse(text);
                  availableSlots = (data.slots || []).filter((s: any) => s.available);
                }
              }
            } catch (fetchErr) {
              console.warn('API slots fetch error (falling back to dynamic slots):', fetchErr);
            }

            // Fallback for static CDN export / Cloudflare Pages or offline demo
            if (availableSlots.length === 0) {
              const defaultTimes = [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
              ];
              availableSlots = defaultTimes.map((time) => ({
                time,
                datetime: `${targetDate}T${time}:00`,
                available: true,
              }));
            }

            ctx.availableSlots = availableSlots;
            setContext(ctx);
            contextRef.current = ctx;

            if (availableSlots.length === 0) {
              agentSpeak(
                `No quedan turnos libres para ${displayDate}. ¿Le gustaría consultar otro día?`,
                'COLLECT_DATE'
              );
            } else {
              const suggested = availableSlots.slice(0, 2).map((s: any) => s.time).join(' y a las ');
              agentSpeak(
                `Para ${displayDate} con ${ctx.doctorName} tengo disponible a las ${suggested}. ¿Cuál de esos horarios prefiere?`,
                'SELECT_SLOT'
              );
            }
            break;
          }

          case 'SELECT_SLOT': {
            let chosenTime = parsed.entities.time;
            const available = ctx.availableSlots || [];

            if (!chosenTime && available.length > 0) {
              if (/primero|primera|temprano/i.test(rawText)) {
                chosenTime = available[0].time;
              } else if (/segundo|segunda|tarde/i.test(rawText) && available.length > 1) {
                chosenTime = available[1].time;
              } else {
                chosenTime = available[0].time;
              }
            }

            const slotObj = available.find((s) => s.time === chosenTime) || available[0];
            if (slotObj) {
              ctx.slotTime = slotObj.time;
              ctx.slotDatetime = slotObj.datetime;
              setContext(ctx);
              contextRef.current = ctx;

              agentSpeak(
                `Muy bien. Confirmo: Cita con ${ctx.doctorName}, el ${ctx.dateDisplay} a las ${ctx.slotTime} por ${ctx.reason}. ¿Desea que la confirme ahora?`,
                'CONFIRMATION'
              );
            } else {
              agentSpeak('Por favor indíqueme qué hora prefiere de las que le mencioné.');
            }
            break;
          }

          case 'CONFIRMATION': {
            if (parsed.intent === 'CONFIRM' || /sí|si|correcto|dale|confirmo|agendar|bien|claro/iu.test(rawText)) {
              setStep('BOOKING');
              stepRef.current = 'BOOKING';
              addMessage('agent', 'Procesando y registrando su cita en el sistema médico...', 'BOOKING');

              let apptData: any = null;
              try {
                const apptRes = await fetch('/api/appointments', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-slug': tenantSlug,
                  },
                  body: JSON.stringify({
                    patient_name: ctx.patientName || 'Paciente por Voz',
                    doctor_id: ctx.doctorId,
                    datetime: ctx.slotDatetime,
                    reason: ctx.reason || 'Consulta médica',
                    booked_via: 'voice_agent',
                    notes: 'Agendado mediante Agente de Voz IA Web Speech',
                  }),
                });

                if (apptRes.ok) {
                  const text = await apptRes.text();
                  if (text.trim().startsWith('{')) {
                    apptData = JSON.parse(text);
                  }
                }
              } catch (apptErr) {
                console.warn('API appointments booking error (falling back to client storage):', apptErr);
              }

              // Fallback to local appointment object for Cloudflare Pages static export / offline mode
              const appointment = apptData?.appointment || {
                id: 'apt_' + Math.random().toString(36).substring(2, 11),
                tenant_id: tenantSlug,
                patient_name: ctx.patientName || 'Paciente por Voz',
                doctor_id: ctx.doctorId,
                doctor_name: ctx.doctorName,
                doctor_specialty: ctx.specialty,
                datetime: ctx.slotDatetime,
                reason: ctx.reason || 'Consulta médica',
                status: 'scheduled',
                booked_via: 'voice_agent',
                notes: 'Agendado mediante Agente de Voz IA Web Speech',
                created_at: new Date().toISOString(),
              };

              // Persist locally in browser storage for demo & guest sessions
              try {
                const saved = JSON.parse(localStorage.getItem('medischedule_guest_appointments') || '[]');
                saved.push(appointment);
                localStorage.setItem('medischedule_guest_appointments', JSON.stringify(saved));
              } catch (_) {}

              ctx.appointmentId = appointment.id;
              setContext(ctx);
              contextRef.current = ctx;
              setStep('SUCCESS');
              stepRef.current = 'SUCCESS';

              if (onAppointmentBooked) {
                onAppointmentBooked(appointment);
              }

              agentSpeak(
                `¡Excelente, ${ctx.patientName}! Su cita ha sido confirmada y agendada exitosamente para el ${ctx.dateDisplay} a las ${ctx.slotTime}. Le esperamos en la clínica.`,
                'SUCCESS'
              );
            } else if (parsed.intent === 'DENY') {
              agentSpeak('De acuerdo, cancelamos este agendamiento. ¿Desea iniciar de nuevo?', 'GREETING');
            } else {
              agentSpeak('Por favor responda diciendo "Sí" para confirmar la cita, o "No" para cancelar.');
            }
            break;
          }

          default:
            break;
        }
      } catch (err: any) {
        console.error('Error in voice dialog step:', err);
        setStep('ERROR');
        stepRef.current = 'ERROR';
        agentSpeak('Hubo un error al procesar su solicitud. ¿Podría repetir?');
      } finally {
        setIsProcessing(false);
      }
    },
    [doctors, stopSpeaking, addMessage, agentSpeak, onAppointmentBooked]
  );

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isRecSupported,
    error: recError,
    hasPermission,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onFinalResult: handleUserSpeech,
    language: 'es-ES',
  });

  // Assign refs so agentSpeak can call them without circular dependencies
  startListeningRef.current = startListening;
  stopListeningRef.current = stopListening;

  const startConversation = useCallback(async () => {
    // 1. Immediately request microphone permission on this user click
    const granted = await startListening();

    setContext({});
    contextRef.current = {};
    setMessages([]);
    resetTranscript();
    setStep('GREETING');
    stepRef.current = 'GREETING';

    // 2. Greet patient
    agentSpeak(
      '¡Hola! Soy el asistente virtual de la clínica médica. ¿Con quién tengo el gusto de hablar hoy?',
      'GREETING'
    );
  }, [startListening, agentSpeak, resetTranscript]);

  const stopConversation = useCallback(() => {
    stopListening();
    stopSpeaking();
    setStep('IDLE');
    stepRef.current = 'IDLE';
  }, [stopListening, stopSpeaking]);

  const sendManualText = useCallback(
    (text: string) => {
      handleUserSpeech(text);
    },
    [handleUserSpeech]
  );

  return {
    step,
    context,
    messages,
    isListening,
    isSpeaking,
    isProcessing,
    transcript,
    interimTranscript,
    isSupported: isRecSupported,
    error: recError,
    hasPermission,
    startConversation,
    stopConversation,
    startListening,
    stopListening,
    sendManualText,
    availableVoices,
    selectedVoice,
    selectVoiceByName,
    rate,
    setRate,
    previewVoice,
  };
}
