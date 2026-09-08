'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, MessageCircle, Radio } from 'lucide-react';
import { speakText, stopSpeaking } from '@/lib/speech';

/**
 * Web Speech API — funciona no Chrome/Edge/Safari sem chave de API.
 * Suporta 2 modos:
 * - Push-to-talk (default): clica pra falar, para quando você para
 * - Modo diálogo (continuous): fala, LOVE responde por voz, mic auto-restart pro próximo turno
 */

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface VoiceChatProps {
  onTranscript: (text: string) => void;
  isSending: boolean;
  ttsText?: string | null;
  dialogueMode: boolean;
  onToggleDialogueMode: () => void;
}

export function VoiceChat({
  onTranscript,
  isSending,
  ttsText,
  dialogueMode,
  onToggleDialogueMode,
}: VoiceChatProps): React.ReactElement | null {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastSpokenRef = useRef<string | null>(null);
  const dialogueModeRef = useRef(dialogueMode);
  const isSendingRef = useRef(isSending);
  useEffect(() => {
    dialogueModeRef.current = dialogueMode;
  }, [dialogueMode]);
  useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  const startListening = useCallback((): void => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isSendingRef.current) return;
    try {
      stopSpeaking();
      rec.start();
      setListening(true);
    } catch {
      /* já rodando */
    }
  }, []);

  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev): void => {
      const results = ev.results;
      let transcript = '';
      for (let i = 0; i < results.length; i++) {
        transcript += results[i]?.[0]?.transcript ?? '';
      }
      const clean = transcript.trim();
      if (clean) onTranscript(clean);
    };
    rec.onerror = (): void => {
      setListening(false);
    };
    rec.onend = (): void => {
      setListening(false);
    };
    recognitionRef.current = rec;
    return () => {
      rec.abort();
      recognitionRef.current = null;
    };
  }, [onTranscript]);

  const stopListening = useCallback((): void => {
    const rec = recognitionRef.current;
    if (!rec) return;
    rec.stop();
  }, []);

  const toggleListen = useCallback((): void => {
    if (listening) stopListening();
    else startListening();
  }, [listening, startListening, stopListening]);

  // TTS: quando ttsText muda e estamos em modo diálogo (ou explicitamente falando), a LOVE fala.
  // No fim da fala, se estamos em modo diálogo, o mic reinicia sozinho.
  useEffect(() => {
    if (!ttsText) return;
    if (ttsText === lastSpokenRef.current) return;
    if (!dialogueModeRef.current) return; // só fala automaticamente se dialogueMode
    lastSpokenRef.current = ttsText;
    speakText(ttsText, {
      onEnd: () => {
        if (dialogueModeRef.current && !isSendingRef.current) {
          startListening();
        }
      },
    });
  }, [ttsText, startListening]);

  // Pré-carrega vozes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (synth.getVoices().length === 0) {
      const handler = (): void => {};
      synth.addEventListener('voiceschanged', handler);
      return () => synth.removeEventListener('voiceschanged', handler);
    }
  }, []);

  // Se ligar dialogueMode, começa a ouvir de cara
  useEffect(() => {
    if (dialogueMode && !listening && !isSending) {
      startListening();
    }
    if (!dialogueMode) {
      stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogueMode]);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListen}
        disabled={isSending}
        aria-label={listening ? 'Parar de gravar' : 'Falar'}
        title={listening ? 'Parar de gravar' : 'Falar'}
        className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center transition-colors border ${
          listening
            ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary animate-pulse'
            : 'bg-bg text-primary border-primary/50 hover:bg-primary/10'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={onToggleDialogueMode}
        aria-label={dialogueMode ? 'Sair do modo diálogo' : 'Entrar no modo diálogo por voz'}
        title={
          dialogueMode
            ? 'Modo diálogo ligado — desliga pra voltar a digitar'
            : 'Modo diálogo por voz — fala e a LOVE responde por voz continuamente'
        }
        className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center transition-colors border ${
          dialogueMode
            ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
            : 'bg-bg text-muted border-rule hover:text-primary hover:border-primary/50'
        }`}
      >
        {dialogueMode ? <Radio className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
      </button>
    </div>
  );
}
