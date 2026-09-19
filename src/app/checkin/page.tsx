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
  const [submitting, setSubmitting] = useState(false);

  async function submit(): Promise<void> {
    setSubmitting(true);
    try {
      await apiClient('/api/checkins', {
        method: 'POST',
        body: JSON.stringify({
          ...scores,
          openNote: openNote.trim() || undefined,
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

        <div className="mt-10 rounded-2xl border border-rule bg-surface p-5">
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

        <div className="mt-10 flex justify-between items-center">
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
