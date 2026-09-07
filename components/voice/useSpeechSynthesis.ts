'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  selectVoiceByName: (name: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  speak: (text: string, onEnd?: () => void) => void;
  stop: () => void;
  previewVoice: (voice?: SpeechSynthesisVoice) => void;
}

// Score voice quality for natural Spanish pronunciation
function scoreSpanishVoice(v: SpeechSynthesisVoice): number {
  if (!v.lang.toLowerCase().startsWith('es')) return -1;

  let score = 10;
  const name = v.name.toLowerCase();

  // Neural & Natural voices are the most human sounding
  if (name.includes('natural')) score += 120;
  if (name.includes('neural')) score += 120;
  if (name.includes('enhanced') || name.includes('mejorada')) score += 90;
  if (name.includes('premium')) score += 90;
  if (name.includes('siri')) score += 70;
  if (name.includes('online')) score += 60;
  if (name.includes('google')) score += 50;
  if (name.includes('microsoft')) score += 50;

  // Well-known natural sounding actors
  if (
    name.includes('elvira') ||
    name.includes('paloma') ||
    name.includes('alvaro') ||
    name.includes('paulina') ||
    name.includes('alba') ||
    name.includes('monica') ||
    name.includes('jorge') ||
    name.includes('lucia') ||
    name.includes('sofia') ||
    name.includes('diego')
  ) {
    score += 40;
  }

  // Preference for es-ES and es-MX for clarity
  if (v.lang.toLowerCase().includes('es-es') || v.lang.toLowerCase().includes('es-mx')) {
    score += 15;
  }

  return score;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState<number>(0.96); // 0.96 is noticeably more natural and relaxed

  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  selectedVoiceRef.current = selectedVoice;

  const rateRef = useRef(rate);
  rateRef.current = rate;

  const safetyTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const allVoices = window.speechSynthesis.getVoices() || [];
        // Filter Spanish voices and sort by quality score descending
        const spanishVoices = allVoices
          .filter((v) => v.lang.toLowerCase().startsWith('es'))
          .sort((a, b) => scoreSpanishVoice(b) - scoreSpanishVoice(a));

        setAvailableVoices(spanishVoices);

        // Pick top scored voice by default if not set
        if (spanishVoices.length > 0 && !selectedVoiceRef.current) {
          const topVoice = spanishVoices[0];
          selectedVoiceRef.current = topVoice;
          setSelectedVoice(topVoice);
        }
      } catch (err) {
        console.warn('Error loading speech voices:', err);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    };
  }, []);

  const selectVoiceByName = useCallback(
    (name: string) => {
      const found = availableVoices.find((v) => v.name === name);
      if (found) {
        setSelectedVoice(found);
        selectedVoiceRef.current = found;
      }
    },
    [availableVoices]
  );

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
    } catch (_) {}

    // Add gentle prosody pauses to punctuation for human-like breathing
    const humanizedText = text
      .replace(/\.\s+/g, '... ')
      .replace(/!\s+/g, '! ')
      .replace(/\?\s+/g, '? ');

    const utterance = new SpeechSynthesisUtterance(humanizedText);
    utterance.lang = selectedVoiceRef.current?.lang || 'es-ES';
    utterance.rate = rateRef.current; // Calm, empathetic rate (0.95 - 0.98)
    utterance.pitch = 1.0;

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    // Safety timeout: Chrome can pause speech or miss onend on long sentences
    const estimatedMs = Math.max(3500, (text.length / 10) * 1000 + 2500);
    safetyTimeoutRef.current = setTimeout(() => {
      if (!finished) {
        finish();
      }
    }, estimatedMs);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('speechSynthesis.speak failed:', e);
      finish();
    }
  }, []);

  const stop = useCallback(() => {
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    setIsSpeaking(false);
  }, []);

  const previewVoice = useCallback(
    (voice?: SpeechSynthesisVoice) => {
      const v = voice || selectedVoiceRef.current;
      if (v) {
        selectedVoiceRef.current = v;
        setSelectedVoice(v);
      }
      speak('Hola, soy tu asistente médico de MediSchedule. ¿Cómo puedo ayudarte hoy?');
    },
    [speak]
  );

  return {
    isSpeaking,
    isSupported,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    selectVoiceByName,
    rate,
    setRate,
    speak,
    stop,
    previewVoice,
  };
}
