import { AppHeader } from '@/components/app-header';
import { Users } from 'lucide-react';

export default function NosPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="rounded-2xl border border-rule bg-surface p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="type-eyebrow mb-2">— nós</p>
          <h1 className="font-display text-2xl md:text-3xl text-heading tracking-tight mb-3">
            O espaço de vocês dois.
          </h1>
          <p className="text-sm text-text/80 leading-relaxed max-w-[46ch] mx-auto">
            Visão geral, história, como cada um vê o outro, conexão, intimidade, desafios. Em breve
            LOVE vai construir isso com vocês, aos poucos, na conversa.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-wider font-semibold text-muted">
            Em breve
          </p>
        </div>
      </main>
    </div>
  );
}
