'use client';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';
import {
  Users,
  Heart,
  Sparkles,
  BookOpen,
  Flame,
  Save,
  Plus,
  X,
  Trash2,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

interface Narrative {
  ourVision: string | null;
  ourHistory: string | null;
  ourValues: string | null;
  connectionRituals: string | null;
}

interface Perception {
  admiration: string | null;
  gratitude: string | null;
  worries: string | null;
  hopes: string | null;
  visibleToPartner: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  visibleToPartner: boolean;
}

const emptyNarrative: Narrative = {
  ourVision: null,
  ourHistory: null,
  ourValues: null,
  connectionRituals: null,
};
const emptyPerception: Perception = {
  admiration: null,
  gratitude: null,
  worries: null,
  hopes: null,
  visibleToPartner: false,
};

export default function NosPage(): React.ReactElement {
  const [narrative, setNarrative] = useState<Narrative>(emptyNarrative);
  const [perception, setPerception] = useState<Perception>(emptyPerception);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [partnerChallenges, setPartnerChallenges] = useState<Challenge[]>([]);
  const [partnerPerception, setPartnerPerception] = useState<
    (Omit<Perception, 'visibleToPartner'> & { updatedAt?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [savedTag, setSavedTag] = useState<string | null>(null);
  const [newChallenge, setNewChallenge] = useState<{ title: string; description: string } | null>(
    null,
  );

  const load = async (): Promise<void> => {
    try {
      const [n, p, c, pp, pc] = await Promise.all([
        apiClient<Narrative | null>('/api/nos/narrative').catch(() => null),
        apiClient<Perception | null>('/api/nos/perception/me').catch(() => null),
        apiClient<{ items: Challenge[] }>('/api/nos/challenges').catch(() => ({ items: [] })),
        apiClient<(Omit<Perception, 'visibleToPartner'> & { updatedAt?: string }) | null>(
          '/api/nos/perception/partner',
        ).catch(() => null),
        apiClient<{ items: Challenge[] }>('/api/nos/challenges/partner').catch(() => ({
          items: [],
        })),
      ]);
      if (n) setNarrative({ ...emptyNarrative, ...n });
      if (p) setPerception({ ...emptyPerception, ...p });
      setChallenges(c.items);
      setPartnerPerception(pp);
      setPartnerChallenges(pc.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const flashSaved = (label: string): void => {
    setSavedTag(label);
    setTimeout(() => setSavedTag(null), 1800);
  };

  const saveNarrative = async (): Promise<void> => {
    await apiClient('/api/nos/narrative', { method: 'PUT', body: JSON.stringify(narrative) });
    flashSaved('narrative');
  };

  const savePerception = async (): Promise<void> => {
    await apiClient('/api/nos/perception/me', { method: 'PUT', body: JSON.stringify(perception) });
    flashSaved('perception');
  };

  const addChallenge = async (): Promise<void> => {
    if (!newChallenge || !newChallenge.title.trim()) return;
    await apiClient('/api/nos/challenges', {
      method: 'POST',
      body: JSON.stringify({
        title: newChallenge.title.trim(),
        description: newChallenge.description.trim() || null,
        visibleToPartner: false,
      }),
    });
    setNewChallenge(null);
    await load();
  };

  const toggleChallengeVisibility = async (c: Challenge): Promise<void> => {
    await apiClient(`/api/nos/challenges/${c.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ visibleToPartner: !c.visibleToPartner }),
    });
    await load();
  };

  const deleteChallenge = async (id: string): Promise<void> => {
    if (!confirm('Remover esse desafio?')) return;
    await apiClient(`/api/nos/challenges/${id}`, { method: 'DELETE' });
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <AppHeader />
        <main className="max-w-2xl mx-auto p-6 text-sm text-muted">carregando…</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-6 md:py-10 space-y-5">
        <header className="mb-2">
          <p className="type-eyebrow mb-1">— nós</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            O espaço de <em className="italic text-primary">vocês dois</em>.
          </h1>
          <p className="mt-2 text-sm text-text/80 max-w-[52ch] leading-relaxed">
            História, valores, como cada um vê o outro. Alguns campos são compartilhados, outros são
            só seus até você decidir mostrar.
          </p>
        </header>

        {/* NARRATIVA COMPARTILHADA */}
        <section className="rounded-2xl border border-rule bg-surface p-5">
          <SectionHeader
            icon={<Users className="w-4 h-4" />}
            title="A gente"
            hint="compartilhado com seu parceiro"
          />
          <div className="space-y-3 mt-4">
            <FieldTa
              label="Nossa visão — o que a gente quer ser juntos"
              value={narrative.ourVision}
              onChange={(v) => setNarrative((p) => ({ ...p, ourVision: v }))}
              placeholder="Ex: um casal que envelhece rindo, viaja duas vezes por ano, cria filhos com autonomia…"
            />
            <FieldTa
              label="Nossa história"
              value={narrative.ourHistory}
              onChange={(v) => setNarrative((p) => ({ ...p, ourHistory: v }))}
              placeholder="Como se conheceram, primeiros marcos, momentos fortes…"
            />
            <FieldTa
              label="Nossos valores"
              value={narrative.ourValues}
              onChange={(v) => setNarrative((p) => ({ ...p, ourValues: v }))}
              placeholder="Honestidade, família, liberdade, fé…"
            />
            <FieldTa
              label="Rituais que nos aproximam"
              value={narrative.connectionRituals}
              onChange={(v) => setNarrative((p) => ({ ...p, connectionRituals: v }))}
              placeholder="Café da manhã do sábado, jantar sem celular, viagem de aniversário…"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <SaveBtn saved={savedTag === 'narrative'} onClick={() => void saveNarrative()} />
          </div>
        </section>

        {/* COMO EU VEJO MEU PARCEIRO */}
        <section className="rounded-2xl border border-rule bg-surface p-5">
          <SectionHeader
            icon={<Heart className="w-4 h-4" />}
            title="Como eu vejo você"
            hint={
              perception.visibleToPartner
                ? 'visível pro seu parceiro'
                : 'privado (só você e a LOVE)'
            }
          />
          <div className="space-y-3 mt-4">
            <FieldTa
              label="O que eu admiro"
              value={perception.admiration}
              onChange={(v) => setPerception((p) => ({ ...p, admiration: v }))}
              placeholder="Qualidades, gestos, jeitos…"
            />
            <FieldTa
              label="Pelo que eu sou grato(a)"
              value={perception.gratitude}
              onChange={(v) => setPerception((p) => ({ ...p, gratitude: v }))}
            />
            <FieldTa
              label="O que me preocupa"
              value={perception.worries}
              onChange={(v) => setPerception((p) => ({ ...p, worries: v }))}
            />
            <FieldTa
              label="O que eu espero"
              value={perception.hopes}
              onChange={(v) => setPerception((p) => ({ ...p, hopes: v }))}
            />
          </div>
          <label className="flex items-start gap-3 mt-4 p-3 rounded-lg bg-bg/70 cursor-pointer">
            <input
              type="checkbox"
              checked={perception.visibleToPartner}
              onChange={(e) =>
                setPerception((p) => ({ ...p, visibleToPartner: e.target.checked }))
              }
              className="mt-1 accent-primary"
            />
            <div className="text-xs text-text/80">
              <strong className="font-semibold text-heading block mb-0.5">
                Compartilhar com meu parceiro
              </strong>
              Se marcado, ele/ela consegue ver o que você escreveu aqui.
            </div>
          </label>
          <div className="mt-4 flex justify-end">
            <SaveBtn saved={savedTag === 'perception'} onClick={() => void savePerception()} />
          </div>
        </section>

        {/* COMO MEU PARCEIRO ME VÊ (só se compartilhou) */}
        {partnerPerception && (
          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <SectionHeader
              icon={<Sparkles className="w-4 h-4" />}
              title="Como seu parceiro te vê"
              hint="ele/ela compartilhou isso com você"
            />
            <div className="space-y-3 mt-4 text-sm text-text/90">
              {partnerPerception.admiration && (
                <ReadOnlyBlock label="admira" text={partnerPerception.admiration} />
              )}
              {partnerPerception.gratitude && (
                <ReadOnlyBlock label="grato(a) por" text={partnerPerception.gratitude} />
              )}
              {partnerPerception.worries && (
                <ReadOnlyBlock label="preocupa" text={partnerPerception.worries} />
              )}
              {partnerPerception.hopes && (
                <ReadOnlyBlock label="espera" text={partnerPerception.hopes} />
              )}
            </div>
          </section>
        )}

        {/* DESAFIOS */}
        <section className="rounded-2xl border border-rule bg-surface p-5">
          <SectionHeader
            icon={<Flame className="w-4 h-4" />}
            title="Meus desafios"
            hint="privados por padrão"
          />
          <p className="text-xs text-text/70 mt-1 mb-4">
            O que tá difícil pra você agora. Fica só entre você e a LOVE — a menos que você marque
            pra compartilhar.
          </p>

          <ul className="space-y-2">
            {challenges.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-rule bg-bg p-3 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-heading">{c.title}</p>
                  {c.description && (
                    <p className="text-xs text-text/70 mt-1 leading-relaxed">{c.description}</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col gap-1 items-end">
                  <button
                    type="button"
                    onClick={() => void toggleChallengeVisibility(c)}
                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full border transition-colors ${
                      c.visibleToPartner
                        ? 'border-primary/40 text-primary bg-primary/10'
                        : 'border-rule text-muted hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {c.visibleToPartner ? (
                      <>
                        <Eye className="w-3 h-3" /> visível
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> privado
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteChallenge(c.id)}
                    className="p-1 text-muted hover:text-danger"
                    aria-label="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
            {challenges.length === 0 && !newChallenge && (
              <li className="text-sm text-muted">Nenhum desafio registrado ainda.</li>
            )}
          </ul>

          {newChallenge ? (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                placeholder="Título — o que te desafia"
                className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
                autoFocus
              />
              <textarea
                value={newChallenge.description}
                onChange={(e) =>
                  setNewChallenge({ ...newChallenge, description: e.target.value })
                }
                placeholder="Contexto (opcional)"
                className="w-full min-h-[70px] px-3 py-2 rounded-lg border border-rule bg-bg text-sm resize-y"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewChallenge(null)}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-muted hover:bg-bg"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void addChallenge()}
                  className="inline-flex items-center gap-1 h-9 px-4 rounded-lg text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))]"
                >
                  <Save className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNewChallenge({ title: '', description: '' })}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Novo desafio
            </button>
          )}
        </section>

        {/* DESAFIOS DO PARCEIRO */}
        {partnerChallenges.length > 0 && (
          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <SectionHeader
              icon={<Flame className="w-4 h-4" />}
              title="Desafios que ele(a) compartilhou"
              hint="visível pra você"
            />
            <ul className="mt-4 space-y-2">
              {partnerChallenges.map((c) => (
                <li key={c.id} className="rounded-lg border border-primary/25 bg-bg/60 p-3">
                  <p className="text-sm font-semibold text-heading">{c.title}</p>
                  {c.description && (
                    <p className="text-xs text-text/70 mt-1 leading-relaxed">{c.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Nota de privacidade */}
        <div className="rounded-xl border border-rule bg-surface/50 p-4 flex items-start gap-3">
          <Lock className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-text/80 leading-relaxed">
            LOVE nunca compartilha algo sem sua marca explícita. Campos "privados" continuam
            invisíveis pro seu parceiro mesmo que ele(a) abra o app.
          </p>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}): React.ReactElement {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1 text-primary">{icon}</div>
      <h2 className="font-display italic text-xl text-heading tracking-tight">{title}</h2>
      <p className="text-xs text-muted mt-0.5">{hint}</p>
    </div>
  );
}

function FieldTa({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
}): React.ReactElement {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
        {label}
      </span>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={placeholder}
        className="w-full min-h-[70px] px-3 py-2 rounded-lg border border-rule bg-bg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function ReadOnlyBlock({ label, text }: { label: string; text: string }): React.ReactElement {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-0.5">
        {label}
      </p>
      <p className="text-sm text-text leading-relaxed">{text}</p>
    </div>
  );
}

function SaveBtn({
  saved,
  onClick,
}: {
  saved: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold transition-colors ${
        saved
          ? 'bg-green-600 text-white'
          : 'bg-primary text-[hsl(var(--primary-fg))] hover:opacity-90'
      }`}
    >
      <Save className="w-3.5 h-3.5" />
      {saved ? 'Salvo!' : 'Salvar'}
    </button>
  );
}
