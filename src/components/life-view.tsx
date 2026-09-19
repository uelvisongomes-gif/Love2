'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { AppHeader } from './app-header';
import { apiClient } from '@/lib/api-client';

export type LifeDomain = 'filhos' | 'metas' | 'tempo_casal';

interface LifeItem {
  id: string;
  domain: LifeDomain;
  title: string;
  description: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  responsibleId: string | null;
  recurring: boolean;
  createdAt: string;
}

interface LifeViewProps {
  domain: LifeDomain;
  eyebrow: string;
  title: string;
  subtitle: string;
  addLabel: string;
  itemNoun: string;
  placeholderTitle: string;
  scheduledAtLabel: string;
  emptyText: string;
  allowRecurring?: boolean;
}

export function LifeView(props: LifeViewProps): React.ReactElement {
  const [items, setItems] = useState<LifeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'open' | 'done'>('open');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LifeItem | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiClient<{ items: LifeItem[] }>(
        `/api/life?domain=${props.domain}&status=${status}`,
      );
      setItems(res.items);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, [props.domain, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleDone(id: string): Promise<void> {
    try {
      await apiClient(`/api/life/${id}/toggle-done`, { method: 'POST' });
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  async function remove(id: string): Promise<void> {
    if (!confirm('Excluir?')) return;
    try {
      await apiClient(`/api/life/${id}`, { method: 'DELETE' });
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
            <p className="type-eyebrow">{props.eyebrow}</p>
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[9px] uppercase tracking-wider font-semibold border border-primary/40 text-primary">
              👥 casal
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
              <em className="text-primary italic">{props.title}</em>
            </h1>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> {props.addLabel}
            </button>
          </div>
          <p className="text-sm text-text font-medium mt-2">{props.subtitle}</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['open', 'done'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`h-8 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                status === s
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:bg-surface'
              }`}
            >
              {s === 'open' ? 'Abertos' : 'Concluídos'}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-rule border-dashed p-10 text-center">
            <p className="text-sm text-text mb-4">{props.emptyText}</p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              Criar {props.itemNoun}
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.id}
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  it.completedAt ? 'border-rule bg-bg opacity-60' : 'border-rule bg-surface'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleDone(it.id)}
                  aria-label={it.completedAt ? 'Reabrir' : 'Concluir'}
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    it.completedAt
                      ? 'border-primary bg-primary text-[hsl(var(--primary-fg))]'
                      : 'border-rule hover:border-primary'
                  }`}
                >
                  {it.completedAt && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold ${
                      it.completedAt ? 'text-muted line-through' : 'text-heading'
                    }`}
                  >
                    {it.title}
                  </h3>
                  {it.description && (
                    <p className="text-xs text-muted mt-0.5 leading-relaxed whitespace-pre-line">
                      {it.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] uppercase tracking-wider font-semibold text-muted">
                    {it.scheduledAt && (
                      <span>
                        {new Date(it.scheduledAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {it.recurring && <span>🔁 recorrente</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(it)}
                    className="text-[11px] text-muted hover:text-primary"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
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

      {(showCreate || editing) && (
        <LifeModal
          domain={props.domain}
          item={editing ?? undefined}
          placeholderTitle={props.placeholderTitle}
          scheduledAtLabel={props.scheduledAtLabel}
          allowRecurring={props.allowRecurring ?? false}
          onClose={() => {
            setShowCreate(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowCreate(false);
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function LifeModal({
  domain,
  item,
  placeholderTitle,
  scheduledAtLabel,
  allowRecurring,
  onClose,
  onSaved,
}: {
  domain: LifeDomain;
  item?: LifeItem;
  placeholderTitle: string;
  scheduledAtLabel: string;
  allowRecurring: boolean;
  onClose: () => void;
  onSaved: () => void;
}): React.ReactElement {
  const isEdit = !!item;
  const [title, setTitle] = useState(item?.title ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [scheduledAt, setScheduledAt] = useState(
    item?.scheduledAt ? item.scheduledAt.slice(0, 10) : '',
  );
  const [recurring, setRecurring] = useState(item?.recurring ?? false);
  const [assignTo, setAssignTo] = useState<'me' | 'partner' | 'both'>('both');
  const [submitting, setSubmitting] = useState(false);

  async function submit(): Promise<void> {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        recurring,
        assignTo,
      };
      if (isEdit && item) {
        await apiClient(`/api/life/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: payload.title,
            description: payload.description ?? null,
            scheduledAt: payload.scheduledAt ?? null,
            recurring: payload.recurring,
            assignTo: payload.assignTo,
          }),
        });
        toast.success('Atualizado.');
      } else {
        await apiClient('/api/life', {
          method: 'POST',
          body: JSON.stringify({ ...payload, domain }),
        });
        toast.success('Criado.');
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
      <div className="bg-bg rounded-2xl border border-rule max-w-lg w-full p-6 shadow-lg max-h-[90dvh] overflow-y-auto">
        <p className="type-eyebrow mb-2">— {isEdit ? 'editar' : 'novo'}</p>
        <h2 className="font-display text-2xl text-heading tracking-tight mb-4">
          {isEdit ? 'Editar' : 'Adicionar'}
        </h2>

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          autoFocus
          placeholder={placeholderTitle}
          className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">{scheduledAtLabel}</label>
        <input
          type="date"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        {allowRecurring && (
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span className="text-sm text-text font-medium">🔁 Recorrente</span>
          </label>
        )}

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Responsável</label>
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
            {submitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
