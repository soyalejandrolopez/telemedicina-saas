'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  hasPermission: boolean | null;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition({
  onFinalResult,
  language = 'es-ES',
}: {
  onFinalResult?: (result: string) => void;
  language?: string;
} = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const isStartingRef = useRef(false);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  // Initialize SpeechRecognition once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError(
        'Tu navegador no soporta Web Speech Recognition. Usa Google Chrome, Microsoft Edge o Safari para voz.'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isStartingRef.current = false;
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      setInterimTranscript(currentInterim);

      if (currentFinal.trim()) {
        const trimmed = currentFinal.trim();
        setTranscript((prev) => (prev ? `${prev} ${trimmed}` : trimmed));

        if (onFinalResultRef.current) {
          onFinalResultRef.current(trimmed);
        }
      }
    };

    recognition.onerror = (event: any) => {
      isStartingRef.current = false;
      console.warn('SpeechRecognition error:', event.error);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setHasPermission(false);
        shouldListenRef.current = false;
        setIsListening(false);
        setError(
          'Acceso al micrófono denegado. Por favor haz clic en el icono de candado/micrófono de la barra de direcciones del navegador y selecciona "Permitir".'
        );
      } else if (event.error === 'no-speech') {
        // Quiet timeout from browser speech engine — restart if we should be listening
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch (_) {}
        }
      } else if (event.error === 'network') {
        setError('Error de conexión con el servicio de reconocimiento de voz.');
      } else if (event.error !== 'aborted') {
        setError(`Error del micrófono: ${event.error}`);
      }
    };

    recognition.onend = () => {
      isStartingRef.current = false;
      // If user did not explicitly stop, restart continuous listening
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (err: any) {
              if (err.name !== 'InvalidStateError') {
                console.warn('Error restarting recognition:', err);
              }
            }
          }
        }, 150);
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [language]);

  const startListening = useCallback(async (): Promise<boolean> => {
    setError(null);

    // 1. Request microphone permission explicitly via getUserMedia to prompt user if not already granted
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close temporary stream immediately; SpeechRecognition will use the system microphone
        stream.getTracks().forEach((track) => track.stop());
        setHasPermission(true);
      } catch (err: any) {
        console.warn('getUserMedia permission error:', err);
        setHasPermission(false);
        setError('Por favor autoriza el acceso al micrófono en el diálogo de tu navegador para hablar con el agente.');
        return false;
      }
    }

    if (!recognitionRef.current) {
      setError('El reconocimiento de voz no está disponible en este navegador.');
      return false;
    }

    shouldListenRef.current = true;

    try {
      isStartingRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
      return true;
    } catch (err: any) {
      isStartingRef.current = false;
      if (err.name === 'InvalidStateError') {
        // Recognition is already active
        setIsListening(true);
        return true;
      }
      console.warn('Could not start recognition:', err);
      setError(`No se pudo activar el micrófono: ${err.message || err.name}`);
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    isStartingRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    hasPermission,
    startListening,
    stopListening,
    resetTranscript,
  };
}
