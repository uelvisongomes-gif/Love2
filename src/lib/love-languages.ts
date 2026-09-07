export const LOVE_LANGUAGES = [
  'palavras_afirmacao',
  'tempo_qualidade',
  'presentes',
  'atos_servico',
  'toque_fisico',
] as const;
export type LoveLanguage = (typeof LOVE_LANGUAGES)[number];

export const LOVE_LANGUAGE_META: Record<
  LoveLanguage,
  { label: string; description: string; icon: string }
> = {
  palavras_afirmacao: {
    label: 'Palavras de afirmação',
    description: 'Elogios sinceros, incentivos, mensagens de carinho e reconhecimento.',
    icon: '❝',
  },
  tempo_qualidade: {
    label: 'Tempo de qualidade',
    description: 'Atenção plena, presença sem celular, conversa sem pressa.',
    icon: '⏳',
  },
  presentes: {
    label: 'Presentes',
    description: 'Lembranças pequenas ou grandes que dizem "pensei em você".',
    icon: '❀',
  },
  atos_servico: {
    label: 'Atos de serviço',
    description: 'Ações práticas que aliviam sua carga do dia a dia.',
    icon: '✿',
  },
  toque_fisico: {
    label: 'Toque físico',
    description: 'Abraços, mãos dadas, proximidade — não só sexual.',
    icon: '✽',
  },
};

export const PILLARS = [
  'financeiro',
  'comunicacao',
  'intimidade',
  'filhos',
  'tarefas',
  'papeis',
  'espiritualidade',
] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_META: Record<Pillar, { label: string; description: string }> = {
  financeiro: { label: 'Financeiro', description: 'Dinheiro, orçamento, planejamento.' },
  comunicacao: { label: 'Comunicação', description: 'Falar e ser ouvida(o) sem se defender.' },
  intimidade: { label: 'Vida íntima', description: 'Sexo, afeto, desejo, cuidado.' },
  filhos: { label: 'Filhos', description: 'Criação, cuidado, decisões parentais.' },
  tarefas: { label: 'Divisão de tarefas', description: 'Casa, rotina, carga mental.' },
  papeis: { label: 'Papéis', description: 'Quem faz o quê no relacionamento.' },
  espiritualidade: { label: 'Espiritualidade', description: 'Fé, valores, significado.' },
};
