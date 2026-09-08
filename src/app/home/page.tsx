import Link from 'next/link';
import { MessageCircleHeart, UserPlus, Sprout, BookHeart } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-6 md:py-8">
        <div className="mb-6">
          <p className="type-eyebrow mb-2">— seu início</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Bem-vinda(o).
          </h1>
          <p className="mt-2 text-sm text-text font-medium max-w-[52ch] leading-relaxed">
            Comece falando com a LOVE — ela ouve, organiza e ajuda a encontrar as próximas palavras. Depois, quando quiser, convide seu parceiro pra vincular vocês.
          </p>
        </div>

        {/* Primary CTA */}
        <Link
          href="/chat"
          className="block group rounded-lg border border-rule bg-surface hover:bg-bg hover:border-primary/50 shadow-soft p-4 md:p-5 mb-4 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
              <MessageCircleHeart className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display italic text-primary text-xl tracking-tight">Falar com a LOVE</h2>
              <p className="text-sm text-text font-medium mt-0.5 leading-relaxed">
                Conta pra ela como você está. Sem julgamento, sem receita pronta — só escuta e caminhos.
              </p>
            </div>
            <div className="hidden sm:block text-primary font-semibold text-xl group-hover:translate-x-1 transition-transform">→</div>
          </div>
        </Link>

        {/* Secondary CTAs */}
        <div className="grid gap-3 md:grid-cols-3">
          <SecondaryCard href="/parceiro" icon={<UserPlus className="w-5 h-5" />} title="Convidar parceiro" description="Vincule vocês pra ativar a ponte." />
          <SecondaryCard href="/checkin" icon={<Sprout className="w-5 h-5" />} title="Check-in do dia" description="1 minuto: como foi hoje?" comingSoon />
          <SecondaryCard href="/journal" icon={<BookHeart className="w-5 h-5" />} title="Só pra você" description="Diário privado, ninguém vê." comingSoon />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'text-muted hover:text-primary')}
          >
            Ajustar meu perfil
          </Link>
        </div>
      </main>
    </div>
  );
}

interface SecondaryProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}

function SecondaryCard({ href, icon, title, description, comingSoon }: SecondaryProps) {
  const inner = (
    <div className="rounded-lg border border-rule bg-bg p-4 h-full flex flex-col hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 text-primary mb-1.5">{icon}<span className="font-display italic text-base tracking-tight">{title}</span></div>
      <p className="text-sm text-text font-medium leading-relaxed flex-1">{description}</p>
      {comingSoon && (
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted mt-2">Em breve</p>
      )}
    </div>
  );
  if (comingSoon) return <div>{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
