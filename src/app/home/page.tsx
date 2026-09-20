'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageCircleHeart,
  Sprout,
  Handshake,
  ListChecks,
  Flame,
  Heart,
  UserPlus,
  Sparkles,
  ChevronRight,
  User,
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

interface Summary {
  me: { name: string; photoUrl: string | null };
  todayCheckin: {
    done: boolean;
    moodOverall: number | null;
    sharedWithPartner: boolean;
    connectionScore: number | null;
    positiveMemory: string | null;
    frictionToday: boolean;
  };
  partner: {
    name: string;
    photoUrl: string | null;
    checkin: { done: boolean; moodOverall: number | null } | null;
  } | null;
  openAgreements: number;
  tasksToday: { id: string; title: string; category: string | null }[];
  streakDays: number;
  lastPositiveMemory: { text: string; date: string } | null;
  hasCoupleLink: boolean;
}

function greetingFor(hour: number): string {
  if (hour < 5) return 'Boa madrugada';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function firstName(full: string): string {
  return full.split(' ')[0] ?? '';
}

function moodLabel(m: number | null): string {
  if (m == null) return '—';
  if (m <= 3) return 'baixo';
  if (m <= 5) return 'baixo-médio';
  if (m <= 7) return 'ok';
  if (m <= 8) return 'bem';
  return 'ótimo';
}

function moodColor(m: number | null): string {
  if (m == null) return 'bg-muted/20 text-muted';
  if (m <= 3) return 'bg-danger/15 text-danger';
  if (m <= 5) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
  if (m <= 7) return 'bg-primary/15 text-primary';
  return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
}

export default function HomePage(): React.ReactElement {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient<Summary>('/api/home/summary');
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = greetingFor(hour);
  const name = data?.me.name ? firstName(data.me.name) : '';

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* GREETING */}
        <header className="mb-6 flex items-center gap-4">
          <Avatar name={data?.me.name ?? ''} photoUrl={data?.me.photoUrl ?? null} size={56} />
          <div className="flex-1 min-w-0">
            <p className="type-eyebrow mb-0.5">— hoje</p>
            <h1 className="font-display text-2xl md:text-3xl text-heading tracking-tight leading-tight">
              {greeting}, <em className="italic text-primary not-italic md:italic">{name}</em>.
            </h1>
            {data && data.streakDays > 1 && (
              <p className="text-xs text-muted mt-1">
                <Sparkles className="w-3 h-3 inline text-primary mr-1" />
                {data.streakDays} dias seguidos de check-in
              </p>
            )}
          </div>
        </header>

        {loading && <p className="text-sm text-muted">carregando…</p>}

        {data && (
          <div className="space-y-4">
            {/* CHECK-IN CARD */}
            {!data.todayCheckin.done ? (
              <PrimaryCta
                href="/checkin"
                title="Fazer check-in do dia"
                subtitle="1-2 minutos. Como você está hoje?"
                icon={<Sprout className="w-5 h-5" />}
              />
            ) : (
              <div className="rounded-2xl border border-rule bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="type-eyebrow text-[10px] mb-1 not-italic uppercase tracking-wider font-semibold">
                      — seu check-in de hoje
                    </p>
                    <p className="text-base font-semibold text-heading">
                      Você está{' '}
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-sm font-semibold ${moodColor(data.todayCheckin.moodOverall)}`}
                      >
                        {moodLabel(data.todayCheckin.moodOverall)}
                      </span>
                    </p>
                    {data.todayCheckin.positiveMemory && (
                      <p className="text-xs text-text/70 mt-2 italic">
                        &quot;{data.todayCheckin.positiveMemory}&quot;
                      </p>
                    )}
                  </div>
                  <Link
                    href="/checkin/historico"
                    className="text-[11px] text-muted hover:text-primary flex items-center gap-0.5"
                  >
                    histórico <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* PARTNER CARD */}
            {data.partner && data.partner.checkin?.done ? (
              <div className="rounded-2xl border border-rule bg-surface p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={data.partner.name} photoUrl={data.partner.photoUrl} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted">Parceiro(a)</p>
                    <p className="text-sm font-semibold text-heading truncate">
                      {firstName(data.partner.name)} fez check-in hoje.
                    </p>
                    {data.partner.checkin.moodOverall != null && (
                      <p className="text-xs mt-1">
                        Está{' '}
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${moodColor(data.partner.checkin.moodOverall)}`}
                        >
                          {moodLabel(data.partner.checkin.moodOverall)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : data.partner && !data.partner.checkin?.done ? (
              <div className="rounded-xl border border-rule bg-surface/60 p-4">
                <p className="text-xs text-muted">
                  {firstName(data.partner.name)} ainda não fez check-in hoje.
                </p>
              </div>
            ) : null}

            {/* FRICTION ALERT */}
            {data.todayCheckin.frictionToday && (
              <Link
                href="/chat?modo=conflict"
                className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 hover:bg-danger/10 transition-colors"
              >
                <Flame className="w-5 h-5 text-danger shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-danger">Teve atrito hoje.</p>
                  <p className="text-xs text-danger/80 mt-0.5">
                    Quer conversar com a LOVE pra resolver?
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-danger/60" />
              </Link>
            )}

            {/* QUICK LOVE */}
            <Link
              href="/chat"
              className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/8 p-5 hover:bg-primary/12 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-primary text-[hsl(var(--primary-fg))] flex items-center justify-center shrink-0">
                <MessageCircleHeart className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display italic text-lg text-heading tracking-tight">
                  Conversar com a LOVE
                </p>
                <p className="text-xs text-text/70 mt-0.5">
                  Desabafo, reflexão, dúvida — do jeito que precisar.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </Link>

            {/* TAREFAS DE HOJE */}
            {data.tasksToday.length > 0 && (
              <Link
                href="/tarefas"
                className="flex items-center gap-3 rounded-xl border border-rule bg-surface hover:border-primary/40 hover:bg-primary/5 transition-colors p-4"
              >
                <ListChecks className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">Tarefas diárias</p>
                  <p className="text-xs text-text/70">
                    {data.tasksToday.length === 1
                      ? '1 tarefa pra hoje'
                      : `${data.tasksToday.length} tarefas pra hoje`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted" />
              </Link>
            )}

            {/* ACORDOS ABERTOS */}
            {data.openAgreements > 0 && (
              <Link
                href="/acordos"
                className="flex items-center gap-3 rounded-xl border border-rule bg-surface hover:border-primary/40 hover:bg-primary/5 transition-colors p-4"
              >
                <Handshake className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">
                    {data.openAgreements} acordo{data.openAgreements > 1 ? 's' : ''} em andamento
                  </p>
                  <p className="text-xs text-text/70">Como está o cumprimento?</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted" />
              </Link>
            )}

            {/* MEMÓRIA POSITIVA */}
            {data.lastPositiveMemory && !data.todayCheckin.done && (
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                      Última memória boa
                    </p>
                    <p className="text-sm text-text mt-1 italic">
                      &quot;{data.lastPositiveMemory.text}&quot;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VINCULAR PARCEIRO */}
            {!data.hasCoupleLink && (
              <Link
                href="/parceiro"
                className="flex items-center gap-3 rounded-xl border border-dashed border-rule bg-surface/50 hover:border-primary/40 hover:bg-primary/5 transition-colors p-4"
              >
                <UserPlus className="w-4 h-4 text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">Vincular parceiro</p>
                  <p className="text-xs text-text/70">
                    LOVE cuida melhor quando conhece os dois.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted" />
              </Link>
            )}

            {/* ATALHOS PILARES */}
            <nav className="pt-2 grid grid-cols-3 gap-3">
              <PillarLink href="/cuidar" title="Cuidar" tone="rose" />
              <PillarLink href="/resolver" title="Resolver" tone="amber" />
              <PillarLink href="/construir" title="Construir" tone="emerald" />
            </nav>
          </div>
        )}
      </main>
    </div>
  );
}

function Avatar({
  name,
  photoUrl,
  size = 40,
}: {
  name: string;
  photoUrl: string | null;
  size?: number;
}): React.ReactElement {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div
      className="rounded-full bg-surface border border-rule overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      ) : initials ? (
        <span
          className="font-display text-primary"
          style={{ fontSize: `${size / 2.4}px` }}
        >
          {initials}
        </span>
      ) : (
        <User className="text-muted" style={{ width: size / 2.2, height: size / 2.2 }} />
      )}
    </div>
  );
}

function PrimaryCta({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}): React.ReactElement {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-primary bg-primary text-[hsl(var(--primary-fg))] p-5 hover:opacity-95 transition-opacity"
    >
      <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display italic text-lg tracking-tight">{title}</p>
        <p className="text-xs opacity-90 mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}

function PillarLink({
  href,
  title,
  tone,
}: {
  href: string;
  title: string;
  tone: 'rose' | 'amber' | 'emerald';
}): React.ReactElement {
  const toneCls = {
    rose: 'border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary',
    amber:
      'border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/5 text-amber-600 dark:text-amber-400',
    emerald:
      'border-emerald-400/30 hover:border-emerald-400/60 hover:bg-emerald-400/5 text-emerald-600 dark:text-emerald-400',
  }[tone];
  return (
    <Link
      href={href}
      className={`text-center rounded-xl border py-3.5 font-display italic text-sm tracking-tight transition-colors ${toneCls}`}
    >
      {title}
    </Link>
  );
}
