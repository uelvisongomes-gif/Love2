import { LifeView } from '@/components/life-view';

export default function FilhosPage(): React.ReactElement {
  return (
    <LifeView
      domain="filhos"
      eyebrow="— construir juntos"
      title="Filhos"
      subtitle="Compromissos, escola, consultas, atividades, quem leva/busca."
      addLabel="Novo"
      itemNoun="compromisso"
      placeholderTitle="Ex: Levar Pedro no futebol"
      scheduledAtLabel="Data"
      emptyText="Nenhum compromisso registrado ainda."
      allowRecurring
    />
  );
}
