import { LifeView } from '@/components/life-view';

export default function MetasPage(): React.ReactElement {
  return (
    <LifeView
      domain="metas"
      eyebrow="— construir juntos"
      title="Metas"
      subtitle="Viagens, casa, reserva financeira, projetos, sonhos do casal."
      addLabel="Nova"
      itemNoun="meta"
      placeholderTitle="Ex: Viagem pra praia no fim do ano"
      scheduledAtLabel="Prazo-alvo"
      emptyText="Nenhuma meta registrada ainda."
    />
  );
}
