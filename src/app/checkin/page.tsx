'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

type Key =
  | 'connectionScore'
  | 'communicationScore'
  | 'affectionScore'
  | 'partnershipScore'
  | 'emotionalScore';

interface Question {
  key: Key;
  label: string;
  helper: string;
}

const QUESTIONS: Question[] = [
  {
    key: 'connectionScore',
    label: 'Conexão com parceiro(a)',
    helper: 'Quanto vocês se sentiram próximos hoje.',
  },
  {
    key: 'communicationScore',
    label: 'Comunicação',
    helper: 'Vocês conseguiram falar e ser ouvidos sem se defender.',
  },
  {
    key: 'affectionScore',
    label: 'Carinho e intimidade',
    helper: 'Toque, olhar, presença — sem obrigatoriedade.',
  },
  {
    key: 'partnershipScore',
    label: 'Parceria nas responsabilidades',
    helper: 'Divisão de tarefas, decisões, apoio prático.',
  },
  {
    key: 'emotionalScore',
    label: 'Você emocionalmente hoje',
    helper: 'Como você está internamente, independente do outro.',
  },
];

const SCALE_LABEL = ['muito ruim', 'ruim', 'ok', 'bem', 'muito bem'];

type Scores = Record<Key, number>;

const initial: Scores = {
  connectionScore: 3,
  communicationScore: 3,
  affectionScore: 3,
  partnershipScore: 3,
  emotionalScore: 3,
};

export default function CheckinPage(): React.ReactElement {
  const router = useRouter();
  const [scores, setScores] = useState<Scores>(initial);
  const [openNote, setOpenNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [sharedWithPartner, setSharedWithPartner] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Etapa 3 — sinais do dia
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [exercisedToday, setExercisedToday] = useState<boolean | null>(null);
  const [frictionToday, setFrictionToday] = useState<boolean | null>(null);
  const [frictionNote, setFrictionNote] = useState('');
  const [intimacyToday, setIntimacyToday] = useState<boolean | null>(null);
  const [positiveMemory, setPositiveMemory] = useState('');

  async function submit(): Promise<void> {
    setSubmitting(true);
    try {
      await apiClient('/api/checkins', {
        method: 'POST',
        body: JSON.stringify({
          ...scores,
          openNote: openNote.trim() || undefined,
          sharedWithPartner,
          sleepHours,
          exercisedToday: exercisedToday ?? false,
          frictionToday: frictionToday ?? false,
          frictionNote: frictionNote.trim() || null,
          intimacyToday: intimacyToday ?? false,
          positiveMemory: positiveMemory.trim() || null,
        }),
      });
      toast.success('Check-in salvo. Que orgulho de você.');
      router.push('/checkin/historico');
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui salvar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <p className="type-eyebrow mb-2">— check-in do dia</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Como está <em className="text-primary italic">hoje</em>?
          </h1>
          <p className="mt-2 text-sm text-text font-medium">
            5 perguntas rápidas, uma escala de 1 a 5. Leva 1 minuto.
          </p>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="font-display text-lg text-heading tracking-tight">{q.label}</h3>
                  <p className="text-xs text-muted font-medium">{q.helper}</p>
                </div>
                <div className="text-right">
                  <div className="font-display italic text-2xl text-primary leading-none">
                    {scores[q.key]}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mt-1">
                    {SCALE_LABEL[scores[q.key] - 1]}
                  </div>
                </div>
              </div>
              <SliderPrimitive.Root
                value={[scores[q.key]]}
                onValueChange={(v) => setScores((prev) => ({ ...prev, [q.key]: v[0] ?? 3 }))}
                min={1}
                max={5}
                step={1}
                className="relative flex items-center w-full h-6 select-none"
              >
                <SliderPrimitive.Track className="bg-rule relative grow rounded-full h-1.5">
                  <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                  className="block w-5 h-5 bg-bg border-2 border-primary rounded-full shadow-soft hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={q.label}
                />
              </SliderPrimitive.Root>
            </div>
          ))}
        </div>

        {/* Sinais do dia — Etapa 3 */}
        <div className="mt-10 rounded-2xl border border-rule bg-surface p-5 space-y-5">
          <div>
            <p className="type-eyebrow mb-1 text-[10px] uppercase tracking-wider not-italic font-semibold">
              — sinais do dia
            </p>
            <h3 className="font-display italic text-lg text-heading tracking-tight">
              O corpo e a rotina.
            </h3>
            <p className="text-xs text-muted mt-1">Rápido — 30 segundos.</p>
          </div>

          {/* Sono */}
          <div>
            <label className="text-sm font-semibold text-heading">Dormiu quantas horas?</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[4, 5, 6, 7, 8, 9].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setSleepHours(sleepHours === h ? null : h)}
                  className={`h-9 min-w-[42px] px-3 rounded-full text-xs font-semibold border transition-colors ${
                    sleepHours === h
                      ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                      : 'bg-bg text-text border-rule hover:border-primary/40'
                  }`}
                >
                  {h}h
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSleepHours(sleepHours === -1 ? null : -1)}
                className={`h-9 px-3 rounded-full text-xs font-semibold border transition-colors ${
                  sleepHours === -1
                    ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                    : 'bg-bg text-text border-rule hover:border-primary/40'
                }`}
              >
                — não sei
              </button>
            </div>
          </div>

          <YesNo
            label="Se exercitou hoje?"
            value={exercisedToday}
            onChange={setExercisedToday}
          />

          <YesNo label="Tiveram atrito hoje?" value={frictionToday} onChange={setFrictionToday} />
          {frictionToday === true && (
            <input
              type="text"
              value={frictionNote}
              onChange={(e) => setFrictionNote(e.target.value)}
              maxLength={500}
              placeholder="Sobre o quê? (opcional)"
              className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}

          <YesNo label="Teve intimidade hoje?" value={intimacyToday} onChange={setIntimacyToday} />

          <div>
            <label className="text-sm font-semibold text-heading">
              Uma coisa boa que aconteceu hoje?
            </label>
            <p className="text-xs text-muted mt-0.5 mb-2">Uma frase. Do dia a dia mesmo.</p>
            <input
              type="text"
              value={positiveMemory}
              onChange={(e) => setPositiveMemory(e.target.value)}
              maxLength={500}
              placeholder='Ex: "café da manhã sem pressa"'
              className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-rule bg-surface p-5">
          <h3 className="font-display text-lg text-heading tracking-tight mb-1">
            Tem alguma coisa te incomodando que vocês ainda não conversaram?
          </h3>
          <p className="text-xs text-muted font-medium mb-3">
            Opcional. Fica só entre você e a LOVE por enquanto.
          </p>
          {!showNote ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="h-9 px-4 rounded-full text-xs font-semibold border border-primary/40 text-primary hover:bg-primary/10"
              >
                Escrever
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNote(false);
                  setOpenNote('');
                }}
                className="h-9 px-4 rounded-full text-xs font-semibold border border-rule text-text hover:bg-bg"
              >
                Não
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={openNote}
                onChange={(e) => setOpenNote(e.target.value)}
                maxLength={2000}
                rows={4}
                autoFocus
                placeholder="Solta o que tá pesando..."
                className="w-full resize-none rounded-lg border border-rule bg-bg p-3 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => {
                  setShowNote(false);
                  setOpenNote('');
                }}
                className="mt-2 text-[11px] text-muted hover:text-primary"
              >
                Cancelar
              </button>
            </>
          )}
        </div>

        {/* Privacy toggle */}
        <div className="mt-8 rounded-2xl border border-rule bg-bg p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sharedWithPartner}
              onChange={(e) => setSharedWithPartner(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-primary"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-heading">
                {sharedWithPartner ? '👥 Compartilhar com meu parceiro' : '🔒 Manter privado'}
              </p>
              <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                {sharedWithPartner
                  ? 'As notas (1-5) desse check-in vão aparecer no histórico do seu parceiro. O texto que você escreveu no campo aberto acima NUNCA é compartilhado — fica só entre você e a LOVE.'
                  : 'Só você vê esse check-in. Nada aparece pro seu parceiro. Marca essa caixa se quiser compartilhar só as notas 1-5 com ele/ela.'}
              </p>
            </div>
          </label>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Link href="/home" className="text-xs text-muted hover:text-primary">
            ← Início
          </Link>
          <Button onClick={submit} disabled={submitting} size="lg">
            {submitting ? 'Salvando...' : 'Concluir check-in'}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/checkin/historico" className="text-xs text-muted hover:text-primary">
            Ver histórico de check-ins
          </Link>
        </div>
      </main>
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}): React.ReactElement {
  return (
    <div>
      <p className="text-sm font-semibold text-heading">{label}</p>
      <div className="mt-2 flex gap-2">
        {[
          { v: true, label: 'Sim' },
          { v: false, label: 'Não' },
        ].map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => onChange(active ? null : opt.v)}
              className={`flex-1 h-9 rounded-full text-xs font-semibold border transition-colors ${
                active
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:border-primary/40'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
