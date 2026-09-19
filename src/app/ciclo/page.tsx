'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Calendar, Heart, Settings, ChevronDown } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

interface Profile {
  averageCycleDays: number;
  averagePeriodDays: number;
  premenstrualDays: number;
  shareWithPartner: boolean;
  sharePeriodStart: boolean;
  sharePreMenstrual: boolean;
  sharePreferences: boolean;
  carePreferences: string[] | null;
  customNote: string | null;
}

interface Period {
  id: string;
  startDate: string;
  endDate: string | null;
}

interface Prediction {
  nextPeriodStart: string | null;
  nextPreMenstrual: string | null;
  daysUntilPeriod: number | null;
  currentPhase: string | null;
}

const PHASE_LABEL: Record<string, string> = {
  menstruacao: 'Menstruação',
  folicular: 'Fase folicular',
  ovulacao: 'Ovulação',
  lutea: 'Fase lútea',
  pre_menstrual: 'Pré-menstrual',
};

const PHASE_DESC: Record<string, string> = {
  menstruacao: 'Descanso, autocuidado. Vale aliviar tarefas.',
  folicular: 'Energia crescente. Bom pra planejar coisas novas.',
  ovulacao: 'Vitalidade e disposição no pico.',
  lutea: 'Foco em finalizar coisas. Início de sensibilidade.',
  pre_menstrual: 'Pode vir sensibilidade, cansaço. Menos pressão ajuda.',
};

const CARE_OPTIONS: { value: string; label: string }[] = [
  { value: 'mais_carinho', label: 'Prefiro mais carinho' },
  { value: 'mais_espaco', label: 'Prefiro mais espaço' },
  { value: 'paciencia_com_sensibilidade', label: 'Paciência se eu estiver sensível' },
  { value: 'ajuda_nas_tarefas', label: 'Ajuda nas tarefas do dia' },
  { value: 'evitar_conversas_dificeis', label: 'Adiar conversas difíceis' },
  { value: 'perguntar_como_estou', label: 'Perguntar como estou antes de presumir' },
  { value: 'lembrar_de_comprar_o_que_preciso', label: 'Lembrar de comprar o que costumo precisar' },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export default function CicloPage(): React.ReactElement {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [p, per, pred] = await Promise.all([
        apiClient<Profile>('/api/cycle/profile'),
        apiClient<{ periods: Period[] }>('/api/cycle/periods'),
        apiClient<Prediction>('/api/cycle/predict'),
      ]);
      setProfile(p);
      setPeriods(per.periods);
      setPrediction(pred);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function logToday(): Promise<void> {
    try {
      await apiClient('/api/cycle/periods', {
        method: 'POST',
        body: JSON.stringify({ startDate: todayISO() }),
      });
      toast.success('Registrado.');
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  async function removePeriod(id: string): Promise<void> {
    try {
      await apiClient(`/api/cycle/periods/${id}`, { method: 'DELETE' });
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  async function updateProfile(patch: Partial<Profile>): Promise<void> {
    try {
      const updated = await apiClient<Profile>('/api/cycle/profile', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setProfile(updated);
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="type-eyebrow">— cuidar</p>
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[9px] uppercase tracking-wider font-semibold border border-muted/40 text-muted">
              🔒 privado
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Meu <em className="text-primary italic">ciclo</em>
          </h1>
          <p className="mt-2 text-sm text-text font-medium">
            Registra quando começa. Nada aparece pro seu parceiro a menos que você autorize.
          </p>
        </div>

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && (
          <>
            {/* Card de fase atual + previsão */}
            {prediction?.currentPhase ? (
              <div className="rounded-2xl border border-rule bg-surface p-5 mb-6">
                <p className="type-eyebrow mb-1">— agora</p>
                <h2 className="font-display italic text-2xl text-primary tracking-tight">
                  {PHASE_LABEL[prediction.currentPhase] ?? '—'}
                </h2>
                <p className="text-sm text-text font-medium mt-1">
                  {PHASE_DESC[prediction.currentPhase] ?? ''}
                </p>
                {prediction.daysUntilPeriod !== null && prediction.nextPeriodStart && (
                  <p className="text-xs text-muted mt-3">
                    Próxima menstruação estimada:{' '}
                    <strong className="text-heading">
                      {formatDate(prediction.nextPeriodStart)}
                    </strong>{' '}
                    ({prediction.daysUntilPeriod > 0 ? `daqui a ${prediction.daysUntilPeriod} dia${prediction.daysUntilPeriod === 1 ? '' : 's'}` : 'esperada'})
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-rule border-dashed p-6 mb-6 text-center">
                <p className="text-sm text-text mb-3">
                  Registra a data do primeiro dia da sua última menstruação pra ver previsões.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={logToday}
              className="w-full h-11 rounded-full bg-primary text-[hsl(var(--primary-fg))] font-semibold text-sm hover:bg-primary/90 mb-3"
            >
              📝 Comecei hoje
            </button>

            {/* Histórico */}
            {periods.length > 0 && (
              <div className="mb-6">
                <p className="type-eyebrow mb-2">— histórico</p>
                <ul className="space-y-2">
                  {periods.slice(0, 6).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-rule bg-bg px-3 py-2"
                    >
                      <span className="text-sm text-text">
                        <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                        Início em <strong className="text-heading">{formatDate(p.startDate)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => removePeriod(p.id)}
                        className="text-[11px] text-muted hover:text-red-600"
                      >
                        Excluir
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferências de cuidado */}
            {profile && (
              <div className="mb-4 rounded-2xl border border-rule bg-surface">
                <button
                  type="button"
                  onClick={() => setShowPrefs(!showPrefs)}
                  className="w-full flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="font-display italic text-lg text-heading tracking-tight">
                      Como gosto de ser cuidada
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform ${showPrefs ? 'rotate-180' : ''}`}
                  />
                </button>
                {showPrefs && (
                  <div className="px-5 pb-5">
                    <p className="text-xs text-muted font-medium mb-3">
                      Marca o que faz sentido pra você. Só o seu parceiro vai ver — e só se você autorizar embaixo.
                    </p>
                    <div className="space-y-2">
                      {CARE_OPTIONS.map((opt) => {
                        const set = new Set(profile.carePreferences ?? []);
                        const active = set.has(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-bg"
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={(e) => {
                                const next = new Set(set);
                                if (e.target.checked) next.add(opt.value);
                                else next.delete(opt.value);
                                void updateProfile({ carePreferences: Array.from(next) });
                              }}
                              className="h-4 w-4 rounded accent-primary"
                            />
                            <span className="text-sm text-text">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mt-4 mb-1">
                      Nota personalizada (opcional)
                    </label>
                    <textarea
                      value={profile.customNote ?? ''}
                      onChange={(e) => setProfile({ ...profile, customNote: e.target.value })}
                      onBlur={() => updateProfile({ customNote: profile.customNote })}
                      maxLength={1000}
                      rows={2}
                      placeholder="Ex: prefiro que me perguntem antes de tocar no assunto."
                      className="w-full resize-none rounded-lg border border-rule bg-bg p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Compartilhamento */}
            {profile && (
              <div className="mb-4 rounded-2xl border border-rule bg-surface">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    <span className="font-display italic text-lg text-heading tracking-tight">
                      Compartilhamento e ajustes
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform ${showSettings ? 'rotate-180' : ''}`}
                  />
                </button>
                {showSettings && (
                  <div className="px-5 pb-5 space-y-4">
                    <p className="text-xs text-muted font-medium">
                      🔒 Tudo desativado por padrão. Escolhe só o que você quer que seu parceiro veja.
                    </p>

                    <Toggle
                      label="Compartilhar com meu parceiro"
                      description="Habilita o painel dele com o que você autorizar embaixo."
                      value={profile.shareWithPartner}
                      onChange={(v) => updateProfile({ shareWithPartner: v })}
                    />
                    <Toggle
                      label="Início da menstruação prevista"
                      description="Ele vê a data estimada, não detalhes."
                      value={profile.sharePeriodStart}
                      disabled={!profile.shareWithPartner}
                      onChange={(v) => updateProfile({ sharePeriodStart: v })}
                    />
                    <Toggle
                      label="Período pré-menstrual"
                      description="Ele recebe aviso um dia antes do começo estimado."
                      value={profile.sharePreMenstrual}
                      disabled={!profile.shareWithPartner}
                      onChange={(v) => updateProfile({ sharePreMenstrual: v })}
                    />
                    <Toggle
                      label="Minhas preferências de cuidado"
                      description="Ele vê como você gosta de ser cuidada nesses dias."
                      value={profile.sharePreferences}
                      disabled={!profile.shareWithPartner}
                      onChange={(v) => updateProfile({ sharePreferences: v })}
                    />

                    <div className="pt-4 border-t border-rule">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                        Duração média do ciclo (dias)
                      </label>
                      <input
                        type="number"
                        min={20}
                        max={45}
                        value={profile.averageCycleDays}
                        onChange={(e) =>
                          setProfile({ ...profile, averageCycleDays: Number(e.target.value) })
                        }
                        onBlur={() => updateProfile({ averageCycleDays: profile.averageCycleDays })}
                        className="w-24 h-9 rounded-lg border border-rule bg-bg px-2 text-sm mb-3"
                      />
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                        Duração da menstruação (dias)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={profile.averagePeriodDays}
                        onChange={(e) =>
                          setProfile({ ...profile, averagePeriodDays: Number(e.target.value) })
                        }
                        onBlur={() => updateProfile({ averagePeriodDays: profile.averagePeriodDays })}
                        className="w-24 h-9 rounded-lg border border-rule bg-bg px-2 text-sm mb-3"
                      />
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                        Dias antes que costumo sentir mudança
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={profile.premenstrualDays}
                        onChange={(e) =>
                          setProfile({ ...profile, premenstrualDays: Number(e.target.value) })
                        }
                        onBlur={() => updateProfile({ premenstrualDays: profile.premenstrualDays })}
                        className="w-24 h-9 rounded-lg border border-rule bg-bg px-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/home" className="text-xs text-muted hover:text-primary">
            ← Voltar
          </Link>
        </div>
      </main>
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded accent-primary"
      />
      <div className="flex-1">
        <p className="text-sm font-semibold text-heading">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
    </label>
  );
}
