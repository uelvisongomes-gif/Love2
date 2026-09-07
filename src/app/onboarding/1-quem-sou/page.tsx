'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { profileStep1, type ProfileStep1 } from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { ToggleButton } from '@/components/toggle-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Step1Page() {
  const router = useRouter();
  const tz =
    typeof window !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
      : 'America/Sao_Paulo';

  const { register, handleSubmit, setValue, watch, formState } = useForm<ProfileStep1>({
    resolver: zodResolver(profileStep1),
    defaultValues: {
      relationshipYears: 1,
      hasChildren: false,
      livingTogether: true,
      timezone: tz,
    },
  });

  async function onSubmit(v: ProfileStep1) {
    try {
      await apiClient('/api/profile', { method: 'PUT', body: JSON.stringify(v) });
      router.push('/onboarding/2-linguagens');
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui salvar.');
    }
  }

  const hasChildren = watch('hasChildren');
  const livingTogether = watch('livingTogether');

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <OnboardingProgress currentStep={1} totalSteps={5} label="quem sou" />

      <div>
        <p className="type-eyebrow mb-3">— primeiro, o básico</p>
        <h1 className="font-display text-4xl text-heading tracking-tight">
          Me conta sobre <em className="text-primary italic">vocês</em>.
        </h1>
        <p className="mt-3 text-text font-medium">
          Nada disso é obrigatório. Você pode voltar e ajustar depois em qualquer momento.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="years">Há quantos anos vocês estão juntos?</Label>
          <Input
            id="years"
            type="number"
            min={0}
            max={80}
            {...register('relationshipYears')}
            className="max-w-[10rem]"
          />
          {formState.errors.relationshipYears && (
            <p className="text-xs text-danger">{formState.errors.relationshipYears.message}</p>
          )}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-heading mb-1">Vocês têm filhos?</legend>
          <div className="flex gap-2">
            <ToggleButton active={!hasChildren} onClick={() => setValue('hasChildren', false)}>
              Não
            </ToggleButton>
            <ToggleButton active={hasChildren} onClick={() => setValue('hasChildren', true)}>
              Sim
            </ToggleButton>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-heading mb-1">Moram juntos?</legend>
          <div className="flex gap-2">
            <ToggleButton active={!livingTogether} onClick={() => setValue('livingTogether', false)}>
              Não
            </ToggleButton>
            <ToggleButton active={livingTogether} onClick={() => setValue('livingTogether', true)}>
              Sim
            </ToggleButton>
          </div>
        </fieldset>

        <input type="hidden" {...register('timezone')} />

        <div className="pt-4 flex justify-end">
          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Salvando...' : 'Avançar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
