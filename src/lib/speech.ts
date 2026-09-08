/**
 * Utility functions for Web Speech API (TTS) — used by chat message play button
 * and continuous voice dialogue mode.
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

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, opts: SpeakOptions = {}): void {
  if (typeof window === 'undefined') return;
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

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  return window.speechSynthesis.speaking;
}
