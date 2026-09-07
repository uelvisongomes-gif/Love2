'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { ToggleButton } from '@/components/toggle-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Step4Page() {
  const router = useRouter();
  const [religionOptIn, setReligionOptIn] = useState(false);
  const [politicsOptIn, setPoliticsOptIn] = useState(false);
  const [religion, setReligion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    try {
      await apiClient('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          preferences: {
            religion: religionOptIn && religion.trim() ? religion.trim() : null,
            religionOptIn,
            politicsOptIn,
            avoidedTopics: [],
          },
        }),
      });
      router.push('/onboarding/5-triagem');
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui salvar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <OnboardingProgress currentStep={4} totalSteps={5} label="preferências" />

      <div>
        <p className="type-eyebrow mb-3">— sobre o que ela pode falar</p>
        <h1 className="font-display text-4xl text-heading tracking-tight">
          Alguns temas <em className="text-primary italic">delicados</em>.
        </h1>
        <p className="mt-3 text-text font-medium">
          A LOVE só toca em espiritualidade e política se você autorizar. Sem opt-in, ela evita esses temas.
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <div>
            <h3 className="font-display italic text-primary text-xl">Espiritualidade</h3>
            <p className="text-sm text-text font-medium">
              Se você quiser, a LOVE pode considerar sua fé nos aconselhamentos.
            </p>
          </div>
          <div className="flex gap-2">
            <ToggleButton active={!religionOptIn} onClick={() => setReligionOptIn(false)}>
              Prefiro não
            </ToggleButton>
            <ToggleButton active={religionOptIn} onClick={() => setReligionOptIn(true)}>
              Pode sim
            </ToggleButton>
          </div>
          {religionOptIn && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="religion">Qual religião? (opcional)</Label>
              <Input
                id="religion"
                placeholder="Ex.: cristianismo, judaísmo, sem religião..."
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                maxLength={40}
              />
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div>
            <h3 className="font-display italic text-primary text-xl">Política</h3>
            <p className="text-sm text-text font-medium">
              Assunto pesado em muitos casais. Só entra na conversa com autorização.
            </p>
          </div>
          <div className="flex gap-2">
            <ToggleButton active={!politicsOptIn} onClick={() => setPoliticsOptIn(false)}>
              Prefiro não
            </ToggleButton>
            <ToggleButton active={politicsOptIn} onClick={() => setPoliticsOptIn(true)}>
              Pode sim
            </ToggleButton>
          </div>
        </section>
      </div>

      <div className="pt-4 flex justify-between items-center">
        <Button type="button" onClick={() => router.push('/onboarding/3-pilares')} variant="ghost">
          Voltar
        </Button>
        <Button type="button" onClick={onSubmit} size="lg" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Avançar'}
        </Button>
      </div>
    </div>
  );
}
