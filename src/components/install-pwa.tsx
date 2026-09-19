'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'love2-install-dismissed';

export function InstallPWA(): React.ReactElement | null {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Detectar se já tá rodando como app instalado
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    // iOS Safari
    const ua = window.navigator.userAgent;
    const iOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    setIsIOS(iOS);
    // Dismiss lembrado
    try {
      if (localStorage.getItem(DISMISSED_KEY)) setDismissed(true);
    } catch {
      /* ignore */
    }
    const handler = (e: Event): void => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss(): void {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  async function install(): Promise<void> {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferred(null);
    } else {
      dismiss();
    }
  }

  if (isStandalone || dismissed) return null;

  // Chrome/Android/Edge — mostra botão
  if (deferred) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
        <div className="bg-primary text-[hsl(var(--primary-fg))] rounded-2xl shadow-lg p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Instalar love2</p>
            <p className="text-xs opacity-90">Tela cheia, sem barra do navegador.</p>
          </div>
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30"
          >
            <Download className="w-3.5 h-3.5" /> Instalar
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dispensar"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // iOS — instrução manual (Safari não tem prompt)
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
        <div className="bg-surface text-text border border-rule rounded-2xl shadow-lg p-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-heading">Adicionar à tela de início</p>
            <p className="text-xs text-muted mt-0.5">
              Toque em <strong className="text-primary">Compartilhar</strong> e depois em{' '}
              <strong className="text-primary">&quot;Adicionar à Tela de Início&quot;</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dispensar"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-bg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
