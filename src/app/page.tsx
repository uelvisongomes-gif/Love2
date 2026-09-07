import Link from 'next/link';
import { RingsLogo } from '@/components/rings-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg">
      <header className="w-full border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-lg text-heading tracking-tight"
          >
            <RingsLogo size={32} />
            love2
          </Link>
          <nav className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/entrar" className={cn(buttonVariants({ variant: 'soft', size: 'sm' }))}>
              Entrar
            </Link>
            <Link
              href="/registrar"
              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 w-full">
          <div className="max-w-3xl">
            <p className="type-eyebrow mb-3">— uma mediadora, não uma terapeuta</p>
            <h1 className="type-display text-[clamp(2rem,4.5vw,3.5rem)] mb-4">
              Uma conversa <em>diferente</em>, sobre a mesma coisa de sempre.
            </h1>
            <p className="text-[1rem] leading-relaxed text-text max-w-[46ch] mb-5">
              O LOVE ouve cada um de vocês em separado, devolve os pontos em Comunicação Não-Violenta, e só faz a ponte com o outro quando você aprova cada trecho.{' '}
              <strong className="text-heading font-semibold">Nada é compartilhado sem o seu ok.</strong>
            </p>
            <div className="flex gap-3">
              <Link
                href="/registrar"
                className={cn(buttonVariants({ variant: 'primary', size: 'lg' }))}
              >
                Começar
              </Link>
              <Link
                href="/entrar"
                className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }))}
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <div>
            Em situação de violência?{' '}
            <strong className="text-heading font-semibold">Ligue 180</strong>
            {' '}·{' '}
            <strong className="text-heading font-semibold">CVV 188</strong> — 24h.
          </div>
          <div>love2 © 2026</div>
        </div>
      </footer>
    </main>
  );
}
