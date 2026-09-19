/**
 * Alarme sonoro em navegador — usa Web Audio API pra gerar um beep de alarme.
 * Não precisa de arquivo. Funciona em qualquer navegador moderno.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function beep(ctx: AudioContext, freq: number, duration: number, delay: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.4, t0 + 0.02);
  gain.gain.linearRampToValueAtTime(0, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Toca um padrão de alarme (bip-bip-bip repetido, ~3 segundos). */
export function playAlarm(): void {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  // 3 bips altos com pausa entre eles
  for (let i = 0; i < 3; i++) {
    beep(ctx, 880, 0.15, i * 0.35);
    beep(ctx, 660, 0.15, i * 0.35 + 0.18);
  }
}

/** Mostra notificação do navegador (se permissão concedida) + toca alarme. */
export function fireAlarm(title: string, body: string): void {
  playAlarm();
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag: 'love2-alarm',
      });
    } catch {
      /* fallback: só som */
    }
  }
}
