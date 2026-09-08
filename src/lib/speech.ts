/**
 * Text-to-Speech usando OpenAI TTS (voz natural via backend proxy).
 * Fallback pra Web Speech API se OpenAI falhar.
 */

export function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .trim();
}

interface SpeakOptions {
  onEnd?: () => void;
  onStart?: () => void;
}

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

function speakWithBrowser(text: string, opts: SpeakOptions): void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(cleanForSpeech(text));
  utter.lang = 'pt-BR';
  utter.rate = 1;
  utter.pitch = 1;
  const voices = synth.getVoices();
  const ptVoice =
    voices.find(
      (v) =>
        v.lang.startsWith('pt') &&
        /female|feminina|Luciana|Camila|Vitoria|Fernanda|Maria/i.test(v.name),
    ) ?? voices.find((v) => v.lang.startsWith('pt'));
  if (ptVoice) utter.voice = ptVoice;
  utter.onstart = (): void => {
    opts.onStart?.();
  };
  utter.onend = (): void => {
    currentUtterance = null;
    opts.onEnd?.();
  };
  utter.onerror = (): void => {
    currentUtterance = null;
    opts.onEnd?.();
  };
  currentUtterance = utter;
  synth.speak(utter);
}

export async function speakText(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  stopSpeaking();
  const clean = cleanForSpeech(text);
  if (!clean) {
    opts.onEnd?.();
    return;
  }
  try {
    const res = await fetch('/api/love/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: clean, voice: 'nova' }),
    });
    if (!res.ok) {
      // fallback pra voz do navegador
      speakWithBrowser(clean, opts);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onplay = (): void => {
      opts.onStart?.();
    };
    audio.onended = (): void => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      opts.onEnd?.();
    };
    audio.onerror = (): void => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      opts.onEnd?.();
    };
    currentAudio = audio;
    await audio.play().catch(() => {
      // fallback se autoplay bloqueado
      speakWithBrowser(clean, opts);
    });
  } catch {
    speakWithBrowser(clean, opts);
  }
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  return !!currentAudio || window.speechSynthesis.speaking;
}
