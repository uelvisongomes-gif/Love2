'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, Baby, Wallet, HeartHandshake, Target, Plus, Bell, BellOff } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';
import { fireAlarm } from '@/lib/alarm';
import {
  getExistingSubscription,
  isPushSupported,
  registerServiceWorker,
  serializeSubscription,
  subscribePush,
  unsubscribePush,
} from '@/lib/push';

type Category = 'casa' | 'filhos' | 'financas' | 'tempo_casal' | 'metas';
type Scope = 'all' | 'mine' | 'partner';
type Status = 'open' | 'done';

type Recurrence = 'daily' | 'weekly' | 'monthly';

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
  recurrence: Recurrence | null;
  remindAt: string | null;
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
  const [editing, setEditing] = useState<Task | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    void registerServiceWorker().then(() => getExistingSubscription()).then((sub) => {
      setPushEnabled(!!sub);
    });
  }, []);

  async function togglePush(): Promise<void> {
    if (!isPushSupported()) {
      toast.error('Seu navegador não suporta notificações.');
      return;
    }
    setPushBusy(true);
    try {
      if (pushEnabled) {
        const sub = await getExistingSubscription();
        if (sub) {
          await apiClient('/api/push/unsubscribe', {
            method: 'POST',
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
        }
        await unsubscribePush();
        setPushEnabled(false);
        toast.success('Notificações desativadas.');
      } else {
        const keyRes = await apiClient<{ publicKey: string | null }>('/api/push/public-key');
        if (!keyRes.publicKey) {
          toast.error('Push não configurado no servidor ainda.');
          return;
        }
        const sub = await subscribePush(keyRes.publicKey);
        if (!sub) {
          toast.error('Permissão negada. Ative nas configurações do navegador.');
          return;
        }
        const payload = { ...serializeSubscription(sub), userAgent: navigator.userAgent };
        await apiClient('/api/push/subscribe', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setPushEnabled(true);
        toast.success('Notificações ativadas — você vai receber os lembretes.');
      }
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    } finally {
      setPushBusy(false);
    }
  }

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

  // Alarme sonoro: verifica a cada 15s se algum lembrete bateu enquanto a aba tá aberta
  useEffect(() => {
    const ALERTED_KEY = 'love2-alerted-task-ids';
    const check = (): void => {
      const now = Date.now();
      const alertedRaw = (typeof window !== 'undefined' ? localStorage.getItem(ALERTED_KEY) : null) ?? '[]';
      let alerted: string[] = [];
      try {
        alerted = JSON.parse(alertedRaw) as string[];
      } catch {
        alerted = [];
      }
      const alertedSet = new Set(alerted);
      let added = false;
      for (const t of tasks) {
        if (!t.remindAt || t.completedAt) continue;
        const remind = new Date(t.remindAt).getTime();
        // Bateu nos últimos 3 min E ainda não avisou
        if (remind <= now && remind >= now - 3 * 60 * 1000 && !alertedSet.has(t.id)) {
          fireAlarm(`⏰ ${t.title}`, 'Lembrete do love2');
          alertedSet.add(t.id);
          added = true;
        }
      }
      if (added && typeof window !== 'undefined') {
        localStorage.setItem(ALERTED_KEY, JSON.stringify(Array.from(alertedSet)));
      }
    };
    check();
    const id = window.setInterval(check, 15_000);
    return () => window.clearInterval(id);
  }, [tasks]);

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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fireAlarm('⏰ Teste', 'Se você tá ouvindo, funciona!')}
                title="Testar som de alarme"
                className="h-10 w-10 rounded-full flex items-center justify-center border bg-bg text-muted border-rule hover:text-primary hover:border-primary/50"
              >
                🔔
              </button>
              <button
                type="button"
                onClick={togglePush}
                disabled={pushBusy}
                title={pushEnabled ? 'Notificações ativas' : 'Ativar notificações'}
                className={`h-10 w-10 rounded-full flex items-center justify-center border transition-colors ${
                  pushEnabled
                    ? 'bg-primary/10 text-primary border-primary/40'
                    : 'bg-bg text-muted border-rule hover:text-primary hover:border-primary/50'
                } disabled:opacity-50`}
              >
                {pushEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" /> Nova
              </button>
            </div>
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
                    {t.remindAt && (
                      <span>
                        🔔{' '}
                        {new Date(t.remindAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    {t.recurrence && (
                      <span>
                        🔁{' '}
                        {t.recurrence === 'daily'
                          ? 'diária'
                          : t.recurrence === 'weekly'
                            ? 'semanal'
                            : 'mensal'}
                      </span>
                    )}
                    {!t.assignedTo ? (
                      <span>ambos</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    className="text-[11px] text-muted hover:text-primary"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    className="text-[11px] text-muted hover:text-red-600"
                  >
                    Excluir
                  </button>
                </div>
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
        <TaskModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            void load();
          }}
        />
      )}
      {editing && (
        <TaskModal
          task={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
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

function TaskModal({
  task,
  onClose,
  onSaved,
}: {
  task?: Task;
  onClose: () => void;
  onSaved: () => void;
}): React.ReactElement {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [category, setCategory] = useState<Category>(task?.category ?? 'casa');
  const [assignTo, setAssignTo] = useState<'me' | 'partner' | 'both'>(
    task ? (task.assignedTo ? 'me' : 'both') : 'both',
  );
  const [dueBy, setDueBy] = useState<string>(
    task?.dueBy ? task.dueBy.slice(0, 10) : '',
  );
  const [remindTime, setRemindTime] = useState<string>(
    task?.remindAt
      ? new Date(task.remindAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',
  );
  const [recurrence, setRecurrence] = useState<'nunca' | Recurrence>(task?.recurrence ?? 'nunca');
  const [submitting, setSubmitting] = useState(false);

  async function submit(): Promise<void> {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      let remindAt: string | undefined;
      if (dueBy && remindTime) {
        remindAt = new Date(`${dueBy}T${remindTime}`).toISOString();
      } else if (remindTime && !dueBy) {
        const today = new Date();
        const [h, m] = remindTime.split(':').map(Number);
        today.setHours(h ?? 0, m ?? 0, 0, 0);
        remindAt = today.toISOString();
      }
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        pillar: PILLAR_FOR_CATEGORY[category],
        assignTo,
        dueBy: dueBy ? new Date(dueBy).toISOString() : null,
        recurrence: recurrence === 'nunca' ? null : recurrence,
        remindAt: remindAt ?? null,
      };
      if (isEdit && task) {
        // PATCH — não manda pillar (não muda) mas manda o resto
        const { pillar: _pillar, ...patchPayload } = payload;
        await apiClient(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          body: JSON.stringify(patchPayload),
        });
        toast.success('Tarefa atualizada.');
      } else {
        await apiClient('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            description: payload.description ?? undefined,
            dueBy: payload.dueBy ?? undefined,
            recurrence: payload.recurrence ?? undefined,
            remindAt: payload.remindAt ?? undefined,
          }),
        });
        toast.success('Tarefa criada.');
      }
      onSaved();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-bg rounded-2xl border border-rule max-w-lg w-full p-6 shadow-lg">
        <p className="type-eyebrow mb-2">— {isEdit ? 'editar' : 'nova tarefa'}</p>
        <h2 className="font-display text-2xl text-heading tracking-tight mb-4">
          {isEdit ? 'Editar tarefa' : 'Criar tarefa'}
        </h2>

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
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input
            type="date"
            value={dueBy}
            onChange={(e) => setDueBy(e.target.value)}
            className="h-10 rounded-lg border border-rule bg-bg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            type="time"
            value={remindTime}
            onChange={(e) => setRemindTime(e.target.value)}
            placeholder="Lembrete"
            className="h-10 rounded-lg border border-rule bg-bg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {remindTime && (
          <p className="text-[11px] text-muted -mt-2 mb-4">
            🔔 Você vai receber notificação nesse horário (ativa as notificações no topo primeiro).
          </p>
        )}

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Repetir</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['nunca', 'daily', 'weekly', 'monthly'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRecurrence(r)}
              className={`h-8 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                recurrence === r
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:bg-surface'
              }`}
            >
              {r === 'nunca'
                ? 'Não repete'
                : r === 'daily'
                  ? 'Todo dia'
                  : r === 'weekly'
                    ? 'Toda semana'
                    : 'Todo mês'}
            </button>
          ))}
        </div>

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
            {submitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}
