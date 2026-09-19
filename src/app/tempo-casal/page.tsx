import { LifeView } from '@/components/life-view';

export default function TempoCasalPage(): React.ReactElement {
  return (
    <LifeView
      domain="tempo_casal"
      eyebrow="— construir juntos"
      title="Tempo do casal"
      subtitle="Encontros, jantar, passeio, viagem, momentos sem celular."
      addLabel="Novo"
      itemNoun="momento"
      placeholderTitle="Ex: Jantar na sexta"
      scheduledAtLabel="Data"
      emptyText="Nenhum momento registrado ainda."
      allowRecurring
    />
  );
}
