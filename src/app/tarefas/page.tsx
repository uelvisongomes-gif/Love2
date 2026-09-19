'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, Baby, Wallet, HeartHandshake, Target, Plus } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

type Category = 'casa' | 'filhos' | 'financas' | 'tempo_casal' | 'metas';
type Scope = 'all' | 'mine' | 'partner';
type Status = 'open' | 'done';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueBy: string | null;
  category: Category | null;
  assignedTo: string | null;
  completedAt: string | null;
  pillar: string;
  createdBy: string;
}

const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode }> = {
  casa: { label: 'Casa', icon: <Home className="w-3.5 h-3.5" /> },
  filhos: { label: 'Filhos', icon: <Baby className="w-3.5 h-3.5" /> },
  financas: { label: 'Finanças', icon: <Wallet className="w-3.5 h-3.5" /> },
  tempo_casal: { label: 'Tempo do casal', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
  metas: { label: 'Metas', icon: <Target className="w-3.5 h-3.5" /> },
};

const CATEGORIES: Category[] = ['casa', 'filhos', 'financas', 'tempo_casal', 'metas'];

const PILLAR_FOR_CATEGORY: Record<Category, string> = {
  casa: 'tarefas',
  filhos: 'filhos',
  financas: 'financeiro',
  tempo_casal: 'comunicacao',
  metas: 'papeis',
};

export default function TarefasPage(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<Scope>('all');
  const [status, setStatus] = useState<Status>('open');
  const [category, setCategory] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scope !== 'all') params.set('scope', scope);
      if (status !== 'open') params.set('status', status);
      if (category) params.set('category', category);
      const res = await apiClient<{ tasks: Task[] }>(`/api/tasks?${params.toString()}`);
      setTasks(res.tasks);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'NO_COUPLE') {
        setTasks([]);
      } else {
        toast.error(e.message || 'Não consegui carregar as tarefas.');
      }
    } finally {
      setLoading(false);
    }
  }, [scope, status, category]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleComplete(t: Task): Promise<void> {
    try {
      if (t.completedAt) {
        await apiClient(`/api/tasks/${t.id}/reopen`, { method: 'POST' });
      } else {
        await apiClient(`/api/tasks/${t.id}/complete`, { method: 'POST' });
      }
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  async function remove(id: string): Promise<void> {
    if (!confirm('Excluir essa tarefa?')) return;
    try {
      await apiClient(`/api/tasks/${id}`, { method: 'DELETE' });
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="type-eyebrow">— nossa parceria</p>
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[9px] uppercase tracking-wider font-semibold border border-primary/40 text-primary">
              👥 casal
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
              <em className="text-primary italic">Tarefas</em>
            </h1>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> Nova
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'mine', 'partner'] as Scope[]).map((s) => (
            <FilterChip key={s} active={scope === s} onClick={() => setScope(s)}>
              {s === 'all' ? 'Todos' : s === 'mine' ? 'Minhas' : 'Parceiro'}
            </FilterChip>
          ))}
          <span className="w-px bg-rule mx-1" />
          {(['open', 'done'] as Status[]).map((s) => (
            <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>
              {s === 'open' ? 'Abertas' : 'Concluídas'}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip active={category === null} onClick={() => setCategory(null)}>
            Todas categorias
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              <span className="inline-flex items-center gap-1">
                {CATEGORY_META[c].icon}
                {CATEGORY_META[c].label}
              </span>
            </FilterChip>
          ))}
        </div>

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && tasks.length === 0 && (
          <div className="rounded-2xl border border-rule border-dashed p-10 text-center">
            <p className="text-sm text-text mb-4">
              {status === 'done'
                ? 'Nenhuma tarefa concluída ainda.'
                : 'Sem tarefas por aqui.'}
            </p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              Criar primeira
            </button>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li
                key={t.id}
                className={`rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                  t.completedAt
                    ? 'border-rule bg-bg opacity-60'
                    : 'border-rule bg-surface'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleComplete(t)}
                  aria-label={t.completedAt ? 'Reabrir' : 'Concluir'}
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    t.completedAt
                      ? 'border-primary bg-primary text-[hsl(var(--primary-fg))]'
                      : 'border-rule hover:border-primary'
                  }`}
                >
                  {t.completedAt && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold ${
                      t.completedAt ? 'text-muted line-through' : 'text-heading'
                    }`}
                  >
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="text-xs text-muted mt-0.5 leading-relaxed whitespace-pre-line">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px] uppercase tracking-wider font-semibold text-muted">
                    {t.category && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        {CATEGORY_META[t.category].icon}
                        {CATEGORY_META[t.category].label}
                      </span>
                    )}
                    {t.dueBy && (
                      <span>
                        até{' '}
                        {new Date(t.dueBy).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    )}
                    {!t.assignedTo ? (
                      <span>ambos</span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="text-[11px] text-muted hover:text-red-600"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <Link href="/home" className="text-xs text-muted hover:text-primary">
            ← Voltar
          </Link>
        </div>
      </main>

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-colors ${
        active
          ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
          : 'bg-bg text-text border-rule hover:bg-surface'
      }`}
    >
      {children}
    </button>
  );
}

function CreateTaskModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}): React.ReactElement {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('casa');
  const [assignTo, setAssignTo] = useState<'me' | 'partner' | 'both'>('both');
  const [dueBy, setDueBy] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(): Promise<void> {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await apiClient('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          pillar: PILLAR_FOR_CATEGORY[category],
          assignTo,
          dueBy: dueBy ? new Date(dueBy).toISOString() : undefined,
        }),
      });
      toast.success('Tarefa criada.');
      onCreated();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-bg rounded-2xl border border-rule max-w-lg w-full p-6 shadow-lg">
        <p className="type-eyebrow mb-2">— nova tarefa</p>
        <h2 className="font-display text-2xl text-heading tracking-tight mb-4">Criar tarefa</h2>

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          autoFocus
          placeholder="Ex: pagar conta de luz"
          className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Categoria</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`h-8 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                category === c
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:bg-surface'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                {CATEGORY_META[c].icon}
                {CATEGORY_META[c].label}
              </span>
            </button>
          ))}
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Quem faz</label>
        <div className="flex gap-2 mb-4">
          {(['me', 'partner', 'both'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAssignTo(v)}
              className={`flex-1 h-9 rounded-full text-xs font-semibold border ${
                assignTo === v
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:bg-surface'
              }`}
            >
              {v === 'me' ? 'Eu' : v === 'partner' ? 'Parceiro' : 'Ambos'}
            </button>
          ))}
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Prazo (opcional)</label>
        <input
          type="date"
          value={dueBy}
          onChange={(e) => setDueBy(e.target.value)}
          className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full resize-none rounded-lg border border-rule bg-bg p-3 text-sm mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-4 rounded-full text-sm font-semibold text-text hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !title.trim()}
            className="h-10 px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Criar tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}
