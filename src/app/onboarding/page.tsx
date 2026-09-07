import Link from 'next/link';
import { RingsLogo } from '@/components/rings-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function OnboardingPlaceholderPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <div className="w-full border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5 font-display text-lg text-heading">
            <RingsLogo size={32} />
            LOVE Casal
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <p className="type-eyebrow mb-4">— em construção</p>
          <h1 className="font-display text-4xl text-heading tracking-tight mb-3">
            O onboarding real chega no próximo plano.
          </h1>
          <p className="text-sm text-muted mb-8">
            Linguagens do amor, notas por pilar, preferências de tema e triagem de segurança.
          </p>
          <Link href="/home" className={cn(buttonVariants({ variant: 'secondary' }))}>
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
