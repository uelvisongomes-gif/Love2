'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';
import { Sparkles, Moon, Flame, Heart, Dumbbell, HeartHandshake } from 'lucide-react';

interface DailyRow {
  date: string;
  moodOverall: number | null;
  connectionScore: number | null;
  communicationScore: number | null;
  affectionScore: number | null;
  partnershipScore: number | null;
  emotionalScore: number | null;
  sleepHours: number | null;
  exercisedToday: boolean;
  frictionToday: boolean;
  intimacyToday: boolean;
  hasPositiveMemory: boolean;
}

interface EvolutionData {
  from: string;
  to: string;
  me: DailyRow[];
  partner: { name: string; rows: DailyRow[] } | null;
  summary: {
    checkinDaysMe: number;
    checkinDaysPartner: number;
    avgMoodMe: number | null;
    avgMoodPartner: number | null;
    frictionDays: number;
    intimacyDays: number;
    positiveMemories: number;
    exerciseDays: number;
    avgSleep: number | null;
  };
}

const RANGES = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
] as const;

export default function EvolucaoPage(): React.ReactElement {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await apiClient<EvolutionData>(`/api/evolution?days=${days}`);
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        <header className="mb-6">
          <p className="type-eyebrow mb-1">— evolução do casal</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Como vocês <em className="italic text-primary">têm</em> ido.
          </h1>
          <p className="mt-2 text-sm text-text/80 max-w-[52ch] leading-relaxed">
            Dados do check-in. Só o que cada um marcou pra compartilhar.
          </p>
        </header>

        <div className="flex gap-2 mb-6">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`h-9 px-4 rounded-full text-xs font-semibold border transition-colors ${
                days === r.days
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:border-primary/40'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted">carregando…</p>}

        {data && (
          <div className="space-y-6">
            {/* SUMMARY GRID */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat
                icon={<Sparkles className="w-4 h-4" />}
                label="Humor médio"
                value={data.summary.avgMoodMe != null ? `${data.summary.avgMoodMe}/10` : '—'}
                hint={
                  data.summary.avgMoodPartner != null
                    ? `parceiro: ${data.summary.avgMoodPartner}/10`
                    : undefined
                }
              />
              <Stat
                icon={<Moon className="w-4 h-4" />}
                label="Sono médio"
                value={data.summary.avgSleep != null ? `${data.summary.avgSleep}h` : '—'}
              />
              <Stat
                icon={<Dumbbell className="w-4 h-4" />}
                label="Dias com exercício"
                value={`${data.summary.exerciseDays}`}
                hint={`${pct(data.summary.exerciseDays, days)}%`}
              />
              <Stat
                icon={<Flame className="w-4 h-4" />}
                label="Dias com atrito"
                value={`${data.summary.frictionDays}`}
                hint={`${pct(data.summary.frictionDays, days)}%`}
                tone="danger"
              />
              <Stat
                icon={<HeartHandshake className="w-4 h-4" />}
                label="Dias com intimidade"
                value={`${data.summary.intimacyDays}`}
                hint={`${pct(data.summary.intimacyDays, days)}%`}
              />
              <Stat
                icon={<Heart className="w-4 h-4" />}
                label="Memórias positivas"
                value={`${data.summary.positiveMemories}`}
              />
            </section>

            {/* SPARKLINES */}
            <section className="space-y-3">
              <Card
                title="Humor geral"
                subtitle="1-10 · você e parceiro"
              >
                <Sparkline
                  values={data.me.map((r) => r.moodOverall)}
                  min={1}
                  max={10}
                  color="hsl(var(--primary))"
                />
                {data.partner && data.partner.rows.some((r) => r.moodOverall !== null) && (
                  <div className="mt-2">
                    <Sparkline
                      values={data.partner.rows.map((r) => r.moodOverall)}
                      min={1}
                      max={10}
                      color="hsl(220 60% 60%)"
                    />
                  </div>
                )}
              </Card>

              <Card title="Conexão" subtitle="1-5">
                <Sparkline
                  values={data.me.map((r) => r.connectionScore)}
                  min={1}
                  max={5}
                  color="hsl(var(--primary))"
                />
              </Card>

              <Card title="Comunicação" subtitle="1-5">
                <Sparkline
                  values={data.me.map((r) => r.communicationScore)}
                  min={1}
                  max={5}
                  color="hsl(200 70% 55%)"
                />
              </Card>

              <Card title="Sono (horas)" subtitle="por noite">
                <Sparkline
                  values={data.me.map((r) => r.sleepHours)}
                  min={0}
                  max={12}
                  color="hsl(240 40% 60%)"
                />
              </Card>

              <Card title="Atrito" subtitle="dias com briga">
                <BarBand values={data.me.map((r) => r.frictionToday)} color="hsl(0 70% 55%)" />
              </Card>

              <Card title="Intimidade" subtitle="dias com intimidade">
                <BarBand values={data.me.map((r) => r.intimacyToday)} color="hsl(var(--primary))" />
              </Card>
            </section>

            <div className="pt-2 text-center">
              <Link
                href="/checkin/historico"
                className="text-xs text-muted hover:text-primary underline"
              >
                Ver check-ins um por um
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function pct(n: number, total: number): number {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="rounded-2xl border border-rule bg-surface p-5">
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display italic text-lg text-heading tracking-tight">{title}</h3>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: 'danger';
}): React.ReactElement {
  const valueCls = tone === 'danger' ? 'text-danger' : 'text-heading';
  return (
    <div className="rounded-xl border border-rule bg-surface p-3">
      <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase tracking-wider font-semibold">
        {icon}
        {label}
      </div>
      <p className={`font-display italic text-xl mt-1 ${valueCls}`}>{value}</p>
      {hint && <p className="text-[11px] text-muted mt-0.5">{hint}</p>}
    </div>
  );
}

function Sparkline({
  values,
  min,
  max,
  color,
}: {
  values: (number | null)[];
  min: number;
  max: number;
  color: string;
}): React.ReactElement {
  const width = 300;
  const height = 60;
  const pad = 3;
  const inner = height - pad * 2;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const points: { x: number; y: number | null }[] = values.map((v, i) => {
    const x = pad + i * step;
    if (v == null) return { x, y: null };
    const norm = (v - min) / (max - min);
    const y = pad + inner - norm * inner;
    return { x, y };
  });
  const filled = points.filter((p): p is { x: number; y: number } => p.y !== null);
  const path =
    filled.length > 0
      ? filled
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(' ')
      : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14" preserveAspectRatio="none">
      <line
        x1={pad}
        y1={pad + inner / 2}
        x2={width - pad}
        y2={pad + inner / 2}
        stroke="hsl(var(--rule))"
        strokeDasharray="2 3"
      />
      {path && <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((p, i) =>
        p.y !== null ? (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
        ) : null,
      )}
    </svg>
  );
}

function BarBand({ values, color }: { values: boolean[]; color: string }): React.ReactElement {
  const width = 300;
  const height = 24;
  const gap = 1;
  const barW = values.length > 0 ? (width - (values.length - 1) * gap) / values.length : 0;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-6" preserveAspectRatio="none">
      {values.map((v, i) => (
        <rect
          key={i}
          x={i * (barW + gap)}
          y={0}
          width={barW}
          height={height}
          fill={v ? color : 'hsl(var(--rule))'}
          opacity={v ? 0.85 : 0.35}
        />
      ))}
    </svg>
  );
}
