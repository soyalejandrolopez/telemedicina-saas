'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

export function VoiceWaveVisualizer({
  isListening,
  isSpeaking,
  className,
}: {
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}) {
  const bars = [
    { height: 'h-4', delay: '0ms' },
    { height: 'h-8', delay: '100ms' },
    { height: 'h-12', delay: '200ms' },
    { height: 'h-6', delay: '300ms' },
    { height: 'h-10', delay: '400ms' },
    { height: 'h-14', delay: '250ms' },
    { height: 'h-7', delay: '150ms' },
    { height: 'h-11', delay: '350ms' },
    { height: 'h-5', delay: '50ms' },
  ];

  const active = isListening || isSpeaking;

  return (
    <div className={twMerge('flex items-center justify-center gap-1.5 h-16', className)}>
      {bars.map((bar, index) => (
        <div
          key={index}
          style={{ animationDelay: bar.delay }}
          className={twMerge(
            'w-1.5 rounded-full transition-all duration-300',
            active
              ? isSpeaking
                ? 'bg-medical-teal animate-wave ' + bar.height
                : 'bg-medical-coral animate-wave ' + bar.height
              : 'bg-slate-300 h-2'
          )}
        />
      ))}
    </div>
  );
}
