import Link from 'next/link';
import {
  MessageCircleHeart,
  BookHeart,
  Sprout,
  Flame,
  Handshake,
  ListChecks,
  UserPlus,
  Wallet,
  Baby,
  Target,
  HeartHandshake,
  CalendarHeart,
  Heart,
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CardDef {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  privacy?: 'privado' | 'casal';
  comingSoon?: boolean;
}

const CUIDAR: CardDef[] = [
  {
    href: '/chat',
    icon: <MessageCircleHeart className="w-5 h-5" />,
    title: 'Conversar',
    description: 'Um bate-papo pra pensar em voz alta com a LOVE.',
    privacy: 'privado',
  },
  {
    href: '/chat?modo=journal',
    icon: <BookHeart className="w-5 h-5" />,
    title: 'Só desabafar',
    description: 'Espaço pra falar sem receber conselho.',
    privacy: 'privado',
  },
  {
    href: '/checkin',
    icon: <Sprout className="w-5 h-5" />,
    title: 'Check-in do dia',
    description: '1 minuto: como foi hoje?',
    privacy: 'privado',
  },
  {
    href: '/ciclo',
    icon: <CalendarHeart className="w-5 h-5" />,
    title: 'Meu ciclo',
    description: 'Calendário do ciclo e preferências de cuidado.',
    privacy: 'privado',
  },
  {
    href: '/ciclo-parceira',
    icon: <Heart className="w-5 h-5" />,
    title: 'Ciclo dela',
    description: 'Se ela compartilhou com você — como cuidar melhor.',
    privacy: 'casal',
  },
];

const RESOLVER: CardDef[] = [
  {
    href: '/chat?modo=conflict',
    icon: <Flame className="w-5 h-5" />,
    title: 'Tem conflito',
    description: 'Mediação em etapas até um acordo prático.',
    privacy: 'privado',
  },
  {
    href: '/acordos',
    icon: <Handshake className="w-5 h-5" />,
    title: 'Acordos do casal',
    description: 'O que combinaram — em andamento e cumpridos.',
    privacy: 'casal',
  },
];

const CONSTRUIR: CardDef[] = [
  {
    href: '/parceiro',
    icon: <UserPlus className="w-5 h-5" />,
    title: 'Vincular parceiro',
    description: 'Ativa os espaços do casal.',
    privacy: 'casal',
  },
  {
    href: '/tarefas',
    icon: <ListChecks className="w-5 h-5" />,
    title: 'Tarefas',
    description: 'Casa, filhos, finanças, tempo do casal, metas.',
    privacy: 'casal',
  },
  {
    href: '/financas',
    icon: <Wallet className="w-5 h-5" />,
    title: 'Finanças',
    description: 'Contas do mês, compras grandes, decisões.',
    privacy: 'casal',
  },
  {
    href: '/filhos',
    icon: <Baby className="w-5 h-5" />,
    title: 'Filhos',
    description: 'Compromissos, escola, quem leva/busca.',
    privacy: 'casal',
  },
  {
    href: '/metas',
    icon: <Target className="w-5 h-5" />,
    title: 'Metas',
    description: 'Viagens, casa, projetos, reserva.',
    privacy: 'casal',
  },
  {
    href: '/tempo-casal',
    icon: <HeartHandshake className="w-5 h-5" />,
    title: 'Tempo do casal',
    description: 'Encontros, jantar, momentos sem celular.',
    privacy: 'casal',
  },
];

export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8">
          <p className="type-eyebrow mb-2">— seu início</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Bem-vinda(o).
          </h1>
          <p className="mt-2 text-sm text-text font-medium max-w-[52ch] leading-relaxed">
            Três pilares pra cuidar de vocês juntos. Comece por onde precisar hoje.
          </p>
        </div>

        <Pillar
          eyebrow="— cuidar do vínculo"
          title="Cuidar"
          description="Escuta, presença, autoconhecimento."
          cards={CUIDAR}
        />

        <Pillar
          eyebrow="— resolver conflitos"
          title="Resolver"
          description="Chegue a acordos claros quando houver briga."
          cards={RESOLVER}
        />

        <Pillar
          eyebrow="— construir a vida juntos"
          title="Construir"
          description="Organize a rotina, os planos e os projetos."
          cards={CONSTRUIR}
        />

        <div className="mt-8 text-center">
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

function Pillar({
  eyebrow,
  title,
  description,
  cards,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cards: CardDef[];
}): React.ReactElement {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="type-eyebrow mb-1">{eyebrow}</p>
        <h2 className="font-display italic text-2xl md:text-3xl text-primary tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-muted font-medium mt-1">{description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.href} card={c} />
        ))}
      </div>
    </section>
  );
}

function PrivacyBadge({ kind }: { kind: 'privado' | 'casal' }): React.ReactElement {
  const isPrivate = kind === 'privado';
  return (
    <span
      className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] uppercase tracking-wider font-semibold border ${
        isPrivate ? 'border-muted/40 text-muted' : 'border-primary/40 text-primary'
      }`}
    >
      {isPrivate ? '🔒 privado' : '👥 casal'}
    </span>
  );
}

function Card({ card }: { card: CardDef }): React.ReactElement {
  const inner = (
    <div className={`rounded-lg border border-rule bg-bg p-4 h-full flex flex-col hover:border-primary/40 transition-colors ${card.comingSoon ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 text-primary">
          {card.icon}
          <span className="font-display italic text-base tracking-tight">{card.title}</span>
        </div>
        {card.privacy && <PrivacyBadge kind={card.privacy} />}
      </div>
      <p className="text-sm text-text font-medium leading-relaxed flex-1">{card.description}</p>
      {card.comingSoon && (
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted mt-2">Em breve</p>
      )}
    </div>
  );
  if (card.comingSoon) return <div>{inner}</div>;
  return <Link href={card.href}>{inner}</Link>;
}
