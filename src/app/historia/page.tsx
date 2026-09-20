import { AppHeader } from '@/components/app-header';
import { BookLock } from 'lucide-react';

export default function HistoriaPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="rounded-2xl border border-rule bg-surface p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <BookLock className="w-6 h-6" />
          </div>
          <p className="type-eyebrow mb-2">— minha história</p>
          <h1 className="font-display text-2xl md:text-3xl text-heading tracking-tight mb-3">
            Só seu. Trancado com um PIN.
          </h1>
          <p className="text-sm text-text/80 leading-relaxed max-w-[46ch] mx-auto">
            Seus registros pessoais, ex-relacionamentos, coisas que ninguém precisa ver. Você cria
            um PIN só pra essa área — separado da sua conta.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-wider font-semibold text-muted">
            Em breve
          </p>
        </div>
      </main>
    </div>
  );
}
