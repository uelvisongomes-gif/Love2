'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Home, Utensils, Car, Heart, Sparkles, GraduationCap, Package, Plus } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

type Kind = 'conta_mensal' | 'compra_grande' | 'decisao';
type Category = 'moradia' | 'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'educacao' | 'outros';

interface Item {
  id: string;
  kind: Kind;
  title: string;
  amount: string | null;
  category: Category | null;
  dueBy: string | null;
  paidAt: string | null;
  responsibleId: string | null;
  recurring: boolean;
  notes: string | null;
  createdAt: string;
}

const KIND_META: Record<Kind, { label: string; desc: string }> = {
  conta_mensal: { label: 'Contas do mês', desc: 'Fixas: luz, água, aluguel, internet.' },
  compra_grande: { label: 'Compras grandes', desc: 'Planejamento: viagem, móvel, eletrodoméstico.' },
  decisao: { label: 'Decisões', desc: 'Precisa combinar juntos.' },
};

const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode }> = {
  moradia: { label: 'Moradia', icon: <Home className="w-3.5 h-3.5" /> },
  alimentacao: { label: 'Alimentação', icon: <Utensils className="w-3.5 h-3.5" /> },
  transporte: { label: 'Transporte', icon: <Car className="w-3.5 h-3.5" /> },
  saude: { label: 'Saúde', icon: <Heart className="w-3.5 h-3.5" /> },
  lazer: { label: 'Lazer', icon: <Sparkles className="w-3.5 h-3.5" /> },
  educacao: { label: 'Educação', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  outros: { label: 'Outros', icon: <Package className="w-3.5 h-3.5" /> },
};

const KINDS: Kind[] = ['conta_mensal', 'compra_grande', 'decisao'];
const CATEGORIES: Category[] = ['moradia', 'alimentacao', 'transporte', 'saude', 'lazer', 'educacao', 'outros'];

function formatMoney(v: string | null): string {
  if (!v) return '—';
  const n = Number(v);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FinancasPage(): React.ReactElement {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<Kind>('conta_mensal');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiClient<{ items: Item[] }>(`/api/finance?kind=${kind}`);
      setItems(res.items);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePaid(it: Item): Promise<void> {
    try {
      await apiClient(`/api/finance/${it.id}/toggle-paid`, { method: 'POST' });
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  async function remove(id: string): Promise<void> {
    if (!confirm('Excluir esse item?')) return;
    try {
      await apiClient(`/api/finance/${id}`, { method: 'DELETE' });
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  const totalPending = items.filter((i) => !i.paidAt).reduce((s, i) => s + Number(i.amount ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p className="type-eyebrow">— construir juntos</p>
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[9px] uppercase tracking-wider font-semibold border border-primary/40 text-primary">
              👥 casal
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
              <em className="text-primary italic">Finanças</em>
            </h1>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> Novo
            </button>
          </div>
        </div>

        {/* Tabs de tipo */}
        <div className="flex flex-wrap gap-2 mb-3">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`h-9 px-4 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
                kind === k
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:bg-surface'
              }`}
            >
              {KIND_META[k].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted font-medium mb-6">{KIND_META[kind].desc}</p>

        {!loading && kind === 'conta_mensal' && items.length > 0 && (
          <div className="rounded-2xl border border-rule bg-surface p-4 mb-6">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">Total pendente</p>
            <p className="font-display italic text-3xl text-primary mt-1">{formatMoney(String(totalPending))}</p>
          </div>
        )}

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-rule border-dashed p-10 text-center">
            <p className="text-sm text-text mb-4">Nenhum item por aqui ainda.</p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              Criar primeiro
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.id}
                className={`rounded-xl border p-4 transition-colors ${
                  it.paidAt ? 'border-rule bg-bg opacity-60' : 'border-rule bg-surface'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => togglePaid(it)}
                    aria-label={it.paidAt ? 'Reabrir' : 'Marcar pago'}
                    className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                      it.paidAt
                        ? 'border-primary bg-primary text-[hsl(var(--primary-fg))]'
                        : 'border-rule hover:border-primary'
                    }`}
                  >
                    {it.paidAt && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3
                        className={`text-sm font-semibold ${
                          it.paidAt ? 'text-muted line-through' : 'text-heading'
                        }`}
                      >
                        {it.title}
                      </h3>
                      {it.amount && (
                        <span className="font-display italic text-primary text-lg whitespace-nowrap">
                          {formatMoney(it.amount)}
                        </span>
                      )}
                    </div>
                    {it.notes && (
                      <p className="text-xs text-muted mt-0.5 leading-relaxed whitespace-pre-line">
                        {it.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] uppercase tracking-wider font-semibold text-muted">
                      {it.category && (
                        <span className="inline-flex items-center gap-1 text-primary">
                          {CATEGORY_META[it.category].icon}
                          {CATEGORY_META[it.category].label}
                        </span>
                      )}
                      {it.dueBy && (
                        <span>
                          {kind === 'conta_mensal' ? 'vence' : 'em'}{' '}
                          {new Date(it.dueBy).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      )}
                      {it.recurring && <span>🔁 mensal</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
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
        <FinanceModal
          kind={editing?.kind ?? kind}
          item={editing ?? undefined}
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

function FinanceModal({
  kind,
  item,
  onClose,
  onSaved,
}: {
  kind: Kind;
  item?: Item;
  onClose: () => void;
  onSaved: () => void;
}): React.ReactElement {
  const isEdit = !!item;
  const [title, setTitle] = useState(item?.title ?? '');
  const [amount, setAmount] = useState(item?.amount ?? '');
  const [category, setCategory] = useState<Category>(item?.category ?? 'outros');
  const [dueBy, setDueBy] = useState(item?.dueBy ? item.dueBy.slice(0, 10) : '');
  const [recurring, setRecurring] = useState(item?.recurring ?? kind === 'conta_mensal');
  const [assignTo, setAssignTo] = useState<'me' | 'partner' | 'both'>('both');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function submit(): Promise<void> {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        amount: amount.trim() ? Number(amount.replace(',', '.')) : undefined,
        category,
        dueBy: dueBy ? new Date(dueBy).toISOString() : undefined,
        recurring,
        notes: notes.trim() || undefined,
        assignTo,
      };
      if (isEdit && item) {
        await apiClient(`/api/finance/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: payload.title,
            amount: payload.amount ?? null,
            category: payload.category,
            dueBy: payload.dueBy ?? null,
            recurring: payload.recurring,
            notes: payload.notes ?? null,
            assignTo: payload.assignTo,
          }),
        });
        toast.success('Atualizado.');
      } else {
        await apiClient('/api/finance', {
          method: 'POST',
          body: JSON.stringify({ ...payload, kind }),
        });
        toast.success('Item criado.');
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
        <p className="type-eyebrow mb-2">— {KIND_META[kind].label}</p>
        <h2 className="font-display text-2xl text-heading tracking-tight mb-4">
          {isEdit ? 'Editar' : 'Novo item'}
        </h2>

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          autoFocus
          placeholder={kind === 'conta_mensal' ? 'Ex: Conta de luz' : kind === 'compra_grande' ? 'Ex: Geladeira nova' : 'Ex: Trocar de plano de saúde'}
          className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Valor (opcional)</label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="R$ 0,00"
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

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
          {kind === 'conta_mensal' ? 'Vencimento' : 'Data-alvo (opcional)'}
        </label>
        <input
          type="date"
          value={dueBy}
          onChange={(e) => setDueBy(e.target.value)}
          className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />

        {kind === 'conta_mensal' && (
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span className="text-sm text-text font-medium">🔁 Conta mensal recorrente</span>
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

        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={2}
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
