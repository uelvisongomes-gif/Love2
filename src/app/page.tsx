import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full px-6 py-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold tracking-tight">LOVE Casal</h1>
        <nav className="flex gap-2">
          <Link
            href="/entrar"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/registrar"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Uma mediadora para o seu relacionamento.
          </h2>
          <p className="text-lg text-muted-foreground">
            LOVE ajuda você e seu parceiro a se comunicarem melhor — com escuta, sem julgamento e com base em métodos reconhecidos. Ela não é psicóloga nem terapeuta.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              href="/registrar"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary text-primary-foreground px-8 text-base font-medium hover:bg-primary/90 transition-colors"
            >
              Começar
            </Link>
            <Link
              href="/entrar"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="text-xs text-muted-foreground pt-8">
            Se você estiver em situação de violência, procure ajuda:{' '}
            <strong>Ligue 180</strong> ou <strong>CVV 188</strong>.
          </p>
        </div>
      </section>

      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        LOVE Casal © 2026
      </footer>
    </main>
  );
}
