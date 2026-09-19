'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

interface Row {
  date: string;
  connectionScore: number | null;
  communicationScore: number | null;
  affectionScore: number | null;
  partnershipScore: number | null;
  emotionalScore: number | null;
  openNote: string | null;
  moodOverall: number | null;
  sharedWithPartner: boolean;
  who: 'me' | 'partner';
}

type DimKey = keyof Pick<
  Row,
  'connectionScore' | 'communicationScore' | 'affectionScore' | 'partnershipScore' | 'emotionalScore'
>;

interface Dim {
  key: DimKey;
  label: string;
}

const DIMS: Dim[] = [
  { key: 'connectionScore', label: 'Conexão' },
  { key: 'communicationScore', label: 'Comunicação' },
  { key: 'affectionScore', label: 'Carinho' },
  { key: 'partnershipScore', label: 'Parceria' },
  { key: 'emotionalScore', label: 'Emocional' },
];

function trendLabel(values: (number | null)[]): { label: string; tone: 'up' | 'down' | 'flat' | 'none' } {
  const nonNull = values.filter((v): v is number => v !== null);
  if (nonNull.length < 2) return { label: 'sem dados', tone: 'none' };
  const half = Math.floor(nonNull.length / 2);
  const older = nonNull.slice(0, half);
  const newer = nonNull.slice(half);
  const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
  const diff = avg(newer) - avg(older);
  if (diff > 0.4) return { label: 'melhorando', tone: 'up' };
  if (diff < -0.4) return { label: 'atenção', tone: 'down' };
  return { label: 'estável', tone: 'flat' };
}

function Sparkline({ values }: { values: (number | null)[] }): React.ReactElement {
  const w = 120;
  const h = 32;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => {
    const x = i * step;
    const y = v === null ? null : h - ((v - 1) / 4) * (h - 4) - 2;
    return { x, y };
  });
  const path = points
    .filter((p) => p.y !== null)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y!.toFixed(1)}`)
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) =>
        p.y !== null ? <circle key={i} cx={p.x} cy={p.y} r="2" fill="currentColor" /> : null,
      )}
    </svg>
  );
}

export default function CheckinHistoricoPage(): React.ReactElement {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<'me' | 'partner'>('me');

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const res = await apiClient<{ checkins: Row[] }>('/api/checkins/history?days=14');
        setRows(res.checkins);
      } catch (err) {
        toast.error((err as Error).message || 'Não consegui carregar o histórico.');
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = rows?.filter((r) => r.who === viewer) ?? null;
  const hasPartnerData = (rows?.some((r) => r.who === 'partner') ?? false);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <p className="type-eyebrow mb-2">— últimas 2 semanas</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Como <em className="text-primary italic">têm ido</em>?
          </h1>
          <p className="mt-2 text-sm text-text font-medium">
            Cada dimensão numa linha. Ponto = você fez o check-in nesse dia.
          </p>
        </div>

        {hasPartnerData && (
          <div className="mb-6 inline-flex rounded-full border border-rule p-1 bg-surface">
            <button
              type="button"
              onClick={() => setViewer('me')}
              className={`h-8 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                viewer === 'me'
                  ? 'bg-primary text-[hsl(var(--primary-fg))]'
                  : 'text-text hover:text-primary'
              }`}
            >
              🔒 Meus
            </button>
            <button
              type="button"
              onClick={() => setViewer('partner')}
              className={`h-8 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                viewer === 'partner'
                  ? 'bg-primary text-[hsl(var(--primary-fg))]'
                  : 'text-text hover:text-primary'
              }`}
            >
              👥 Parceiro
            </button>
          </div>
        )}

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && filtered && filtered.length === 0 && (
          <div className="rounded-2xl border border-rule border-dashed p-10 text-center">
            <p className="text-sm text-text mb-4">Ainda sem check-ins.</p>
            <Link
              href="/checkin"
              className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              Fazer meu primeiro
            </Link>
          </div>
        )}

        {!loading && filtered && filtered.length > 0 && (
          <>
            <ul className="space-y-3">
              {DIMS.map((d) => {
                const values = filtered.map((r) => r[d.key]);
                const trend = trendLabel(values);
                const last = [...values].reverse().find((v) => v !== null);
                return (
                  <li
                    key={d.key}
                    className="rounded-xl border border-rule bg-surface p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base text-heading tracking-tight">
                        {d.label}
                      </h3>
                      <p
                        className={`text-[11px] uppercase tracking-wider font-semibold ${
                          trend.tone === 'up'
                            ? 'text-green-700'
                            : trend.tone === 'down'
                              ? 'text-amber-700'
                              : 'text-muted'
                        }`}
                      >
                        {trend.label}
                      </p>
                    </div>
                    <div className="text-primary shrink-0">
                      <Sparkline values={values} />
                    </div>
                    <div className="text-right shrink-0 w-10">
                      <div className="font-display italic text-2xl text-primary leading-none">
                        {last ?? '—'}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {viewer === 'me' && filtered.some((r) => r.openNote) && (
              <div className="mt-8">
                <p className="type-eyebrow mb-2">— o que ficou pesando (🔒 só você vê)</p>
                <ul className="space-y-3">
                  {filtered
                    .filter((r) => r.openNote)
                    .slice(-5)
                    .reverse()
                    .map((r) => (
                      <li key={r.date} className="rounded-xl border border-rule bg-surface p-4">
                        <div className="text-[11px] uppercase tracking-wider text-muted font-semibold mb-1">
                          {new Date(r.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </div>
                        <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                          {r.openNote}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="mt-10 flex justify-between items-center">
          <Link href="/home" className="text-xs text-muted hover:text-primary">
            ← Início
          </Link>
          <Link
            href="/checkin"
            className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
          >
            Novo check-in
          </Link>
        </div>
      </main>
    </div>
  );
}
