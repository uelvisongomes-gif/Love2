'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

/**
 * Web Speech API — funciona no Chrome/Edge/Safari sem chave de API.
 * SpeechRecognition (STT) e speechSynthesis (TTS).
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
  ttsText?: string | null; // texto que a LOVE deve falar quando chegar
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

export function VoiceChat({
  onTranscript,
  isSending,
  ttsText,
  autoSpeak,
  onToggleAutoSpeak,
}: VoiceChatProps): React.ReactElement | null {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastSpokenRef = useRef<string | null>(null);

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
    // onTranscript stable via useCallback in parent
  }, [onTranscript]);

  const toggleListen = useCallback((): void => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
    } else {
      try {
        // interrompe TTS se estiver falando
        if (typeof window !== 'undefined') window.speechSynthesis.cancel();
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }, [listening]);

  // Toca TTS quando ttsText chega novo (e autoSpeak ligado)
  useEffect(() => {
    if (!autoSpeak) return;
    if (!ttsText) return;
    if (ttsText === lastSpokenRef.current) return;
    if (typeof window === 'undefined') return;
    lastSpokenRef.current = ttsText;
    const synth = window.speechSynthesis;
    synth.cancel();
    // remove markdown básico pra não falar asteriscos
    const clean = ttsText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/[*_`#>]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'pt-BR';
    utter.rate = 1;
    utter.pitch = 1;
    // Escolhe voz feminina em pt-BR se disponível
    const voices = synth.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.startsWith('pt') && /female|feminina|Luciana|Camila|Vitoria|Fernanda|Maria/i.test(v.name),
    ) ?? voices.find((v) => v.lang.startsWith('pt'));
    if (ptVoice) utter.voice = ptVoice;
    synth.speak(utter);
  }, [ttsText, autoSpeak]);

  // Pré-carrega vozes (Chrome async)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (synth.getVoices().length === 0) {
      const handler = (): void => {
        /* just triggers cache */
      };
      synth.addEventListener('voiceschanged', handler);
      return () => synth.removeEventListener('voiceschanged', handler);
    }
  }, []);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListen}
        disabled={isSending}
        aria-label={listening ? 'Parar de gravar' : 'Falar com a LOVE'}
        title={listening ? 'Parar de gravar' : 'Falar com a LOVE'}
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
        onClick={onToggleAutoSpeak}
        aria-label={autoSpeak ? 'Silenciar respostas' : 'LOVE responde por voz'}
        title={autoSpeak ? 'Silenciar respostas' : 'LOVE responde por voz'}
        className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center transition-colors border ${
          autoSpeak
            ? 'bg-primary/10 text-primary border-primary/50'
            : 'bg-bg text-muted border-rule hover:text-primary'
        }`}
      >
        {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );
}
