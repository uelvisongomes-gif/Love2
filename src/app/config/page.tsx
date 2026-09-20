'use client';
import { AppHeader } from '@/components/app-header';
import { Settings, LogOut } from 'lucide-react';

export default function ConfigPage(): React.ReactElement {
  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    window.location.href = '/entrar';
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        <header className="mb-8">
          <p className="type-eyebrow mb-2">— configurações</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Ajustes.
          </h1>
        </header>

        <div className="rounded-xl border border-rule bg-surface p-5 mb-4">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <h2 className="font-display italic text-lg text-heading">Notificações, tema, privacidade</h2>
              <p className="text-sm text-text/70 mt-1">
                Em breve — controle fino de push, e-mail e o que a LOVE guarda.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-rule bg-surface hover:bg-danger/5 hover:border-danger/40 hover:text-danger transition-colors py-3 text-sm font-medium text-muted"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </main>
    </div>
  );
}
