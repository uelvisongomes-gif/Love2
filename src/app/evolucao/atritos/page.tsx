'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Flame, ArrowLeft, Sparkles } from 'lucide-react';

function AtritosPageInner(): React.ReactElement {
  const search = useSearchParams();
  const motivo = search.get('motivo') ?? 'Atritos';

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link
          href="/evolucao"
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary mb-4"
        >
          <ArrowLeft className="w-3 h-3" /> Voltar pra Evolução
        </Link>

        <header className="mb-6 flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-danger/15 text-danger flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="type-eyebrow mb-0.5 text-danger">— dashboard de atritos</p>
            <h1 className="font-display text-2xl md:text-3xl text-heading tracking-tight">
              {motivo}
            </h1>
          </div>
        </header>

        <div className="rounded-2xl border border-rule bg-surface p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display italic text-xl text-heading mb-2">Em breve</h2>
          <p className="text-sm text-text/80 leading-relaxed max-w-[50ch] mx-auto">
            Métricas detalhadas por atrito precisam de dados que ainda não coletamos no check-in:
          </p>
          <ul className="text-sm text-text/80 mt-4 space-y-2 text-left max-w-sm mx-auto">
            <li>• Quem começou o atrito</li>
            <li>• Quem primeiro propôs pausa / reconciliação</li>
            <li>• Quem pediu desculpa</li>
            <li>• Quem se calou / fugiu do diálogo</li>
            <li>• Quanto tempo levou pra voltar a se falar</li>
          </ul>
          <p className="text-xs text-muted mt-6 leading-relaxed">
            Nas próximas versões, o check-in vai perguntar isso quando você marcar &quot;tive atrito hoje&quot;.
            E a LOVE vai cruzar os dois lados quando ambos compartilharem — sem revelar julgamentos,
            só padrões.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-xs text-text/80 leading-relaxed">
            <strong className="text-heading">Enquanto isso</strong>: quando este motivo (&quot;{motivo}&quot;)
            aparecer no seu check-in, considere abrir uma mediação conjunta em{' '}
            <Link href="/mediacoes" className="text-primary underline">
              /mediacoes
            </Link>{' '}
            — vocês dois respondem 4 perguntas privadas e a LOVE devolve uma síntese neutra.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AtritosPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <AtritosPageInner />
    </Suspense>
  );
}
