'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { LOVE_LANGUAGES, LOVE_LANGUAGE_META, type LoveLanguage } from '@/lib/love-languages';
import { apiClient } from '@/lib/api-client';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { Button } from '@/components/ui/button';

const ORDINALS = ['1º', '2º', '3º', '4º', '5º'];

function SortableCard({ id, index }: { id: LoveLanguage; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const meta = LOVE_LANGUAGE_META[id];
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-4 p-4 rounded-lg border border-rule bg-bg shadow-soft"
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <span className="font-display italic text-primary text-lg leading-none">{ORDINALS[index]}</span>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted hover:text-heading cursor-grab active:cursor-grabbing touch-none"
          aria-label="Arrastar pra reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-primary text-base leading-none">{meta.icon}</span>
          <h3 className="font-display text-lg text-heading tracking-tight">{meta.label}</h3>
        </div>
        <p className="text-sm text-text font-medium mt-1 leading-relaxed">{meta.description}</p>
      </div>
    </div>
  );
}

export default function Step2Page() {
  const router = useRouter();
  const [order, setOrder] = useState<LoveLanguage[]>([...LOVE_LANGUAGES]);
  const [submitting, setSubmitting] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as LoveLanguage);
      const newIndex = prev.indexOf(over.id as LoveLanguage);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function onSubmit() {
    setSubmitting(true);
    try {
      await apiClient('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ loveLanguagesRanking: order }),
      });
      router.push('/onboarding/3-pilares');
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui salvar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <OnboardingProgress currentStep={2} totalSteps={5} label="linguagens do amor" />

      <div>
        <p className="type-eyebrow mb-3">— o que mais importa pra você</p>
        <h1 className="font-display text-4xl text-heading tracking-tight">
          Como você <em className="text-primary italic">recebe</em> amor?
        </h1>
        <p className="mt-3 text-text font-medium">
          Arraste pra colocar do mais importante (topo) ao menos importante (baixo). A LOVE usa isso pra sugerir gestos concretos que fazem sentido pra você.
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {order.map((id, i) => (
              <SortableCard key={id} id={id} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="pt-4 flex justify-between items-center">
        <Button
          type="button"
          onClick={() => router.push('/onboarding/1-quem-sou')}
          variant="ghost"
        >
          Voltar
        </Button>
        <Button type="button" onClick={onSubmit} size="lg" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Avançar'}
        </Button>
      </div>
    </div>
  );
}
