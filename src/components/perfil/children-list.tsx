'use client';
import { useEffect, useState } from 'react';
import { Plus, Baby, Trash2, Pencil, X, Save } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Child {
  id: string;
  name: string;
  birthDate: string | null;
  gender: 'menino' | 'menina' | 'outro' | null;
  parentage: 'biologico_ambos' | 'biologico_um' | 'adotado' | 'enteado' | null;
  livesWith: 'conosco' | 'pai' | 'mae' | 'alternado' | null;
  schoolInfo: string | null;
  healthNotes: string | null;
  personality: string | null;
}

type Draft = Omit<Child, 'id'> & { id?: string };

const emptyDraft: Draft = {
  name: '',
  birthDate: null,
  gender: null,
  parentage: null,
  livesWith: null,
  schoolInfo: null,
  healthNotes: null,
  personality: null,
};

export function ChildrenList(): React.ReactElement {
  const [items, setItems] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiClient<{ items: Child[] }>('/api/children');
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const save = async (): Promise<void> => {
    if (!draft || !draft.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: draft.name.trim(),
        birthDate: draft.birthDate ? new Date(draft.birthDate).toISOString() : null,
        gender: draft.gender,
        parentage: draft.parentage,
        livesWith: draft.livesWith,
        schoolInfo: draft.schoolInfo?.trim() || null,
        healthNotes: draft.healthNotes?.trim() || null,
        personality: draft.personality?.trim() || null,
      };
      if (draft.id) {
        await apiClient(`/api/children/${draft.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await apiClient('/api/children', { method: 'POST', body: JSON.stringify(body) });
      }
      setDraft(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string): Promise<void> => {
    if (!confirm('Remover esse filho do perfil?')) return;
    await apiClient(`/api/children/${id}`, { method: 'DELETE' });
    await reload();
  };

  const startEdit = (c: Child): void => {
    setDraft({
      ...c,
      birthDate: c.birthDate ? c.birthDate.slice(0, 10) : null,
    });
  };

  return (
    <section className="rounded-2xl border border-rule bg-surface p-5">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Baby className="w-4 h-4 text-primary" />
          <h2 className="font-display italic text-lg text-heading">Filhos</h2>
        </div>
        {!draft && (
          <button
            type="button"
            onClick={() => setDraft({ ...emptyDraft })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        )}
      </header>

      {loading && <p className="text-xs text-muted">carregando…</p>}

      {!loading && items.length === 0 && !draft && (
        <p className="text-sm text-muted">Sem filhos registrados. Toque em adicionar se tiver.</p>
      )}

      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-rule bg-bg"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text">
                {c.name}
                {c.birthDate && (
                  <span className="ml-2 text-xs font-normal text-muted">
                    {computeAge(c.birthDate)}
                  </span>
                )}
              </p>
              {(c.parentage || c.livesWith) && (
                <p className="text-[11px] text-muted mt-0.5">
                  {c.parentage && <span>{labelParentage(c.parentage)}</span>}
                  {c.parentage && c.livesWith && <span> · </span>}
                  {c.livesWith && <span>mora {labelLivesWith(c.livesWith)}</span>}
                </p>
              )}
              {c.healthNotes && (
                <p className="text-xs text-text/80 mt-1 leading-relaxed">
                  <span className="font-semibold">Saúde:</span> {c.healthNotes}
                </p>
              )}
              {c.personality && (
                <p className="text-xs text-text/70 mt-1 leading-relaxed italic">{c.personality}</p>
              )}
            </div>
            <div className="shrink-0 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => startEdit(c)}
                className="p-1 rounded hover:bg-surface text-muted hover:text-primary"
                aria-label="Editar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => void remove(c.id)}
                className="p-1 rounded hover:bg-surface text-muted hover:text-danger"
                aria-label="Remover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {draft && (
        <div className="mt-4 space-y-3 border-t border-rule pt-4">
          <Field label="Nome">
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
              placeholder="Ex: Pedro"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nascimento">
              <input
                type="date"
                value={draft.birthDate ?? ''}
                onChange={(e) => setDraft({ ...draft, birthDate: e.target.value || null })}
                className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
              />
            </Field>
            <Field label="Gênero">
              <select
                value={draft.gender ?? ''}
                onChange={(e) => setDraft({ ...draft, gender: (e.target.value || null) as Draft['gender'] })}
                className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
              >
                <option value="">—</option>
                <option value="menino">Menino</option>
                <option value="menina">Menina</option>
                <option value="outro">Outro</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Parentesco">
              <select
                value={draft.parentage ?? ''}
                onChange={(e) =>
                  setDraft({ ...draft, parentage: (e.target.value || null) as Draft['parentage'] })
                }
                className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
              >
                <option value="">—</option>
                <option value="biologico_ambos">Biológico (dos dois)</option>
                <option value="biologico_um">Biológico (só um)</option>
                <option value="adotado">Adotado</option>
                <option value="enteado">Enteado</option>
              </select>
            </Field>
            <Field label="Mora">
              <select
                value={draft.livesWith ?? ''}
                onChange={(e) =>
                  setDraft({ ...draft, livesWith: (e.target.value || null) as Draft['livesWith'] })
                }
                className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
              >
                <option value="">—</option>
                <option value="conosco">Conosco</option>
                <option value="pai">Com o pai</option>
                <option value="mae">Com a mãe</option>
                <option value="alternado">Alternado</option>
              </select>
            </Field>
          </div>
          <Field label="Escola / rotina">
            <input
              type="text"
              value={draft.schoolInfo ?? ''}
              onChange={(e) => setDraft({ ...draft, schoolInfo: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
              placeholder="Ex: 3º ano, escola X"
            />
          </Field>
          <Field label="Saúde / condições / remédios">
            <textarea
              value={draft.healthNotes ?? ''}
              onChange={(e) => setDraft({ ...draft, healthNotes: e.target.value })}
              className="w-full min-h-[70px] px-3 py-2 rounded-lg border border-rule bg-bg text-sm resize-y"
              placeholder="Ex: alergia a amendoim, TDAH, ritalina 10mg de manhã"
            />
          </Field>
          <Field label="Personalidade / gostos">
            <textarea
              value={draft.personality ?? ''}
              onChange={(e) => setDraft({ ...draft, personality: e.target.value })}
              className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-rule bg-bg text-sm resize-y"
              placeholder="Ex: tímido, ama Minecraft, difícil na hora de dormir"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-muted hover:bg-bg"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !draft.name.trim()}
              className="inline-flex items-center gap-1 h-9 px-4 rounded-lg text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" /> Salvar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function computeAge(iso: string): string {
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) years--;
  if (years < 1) {
    const months = years * 12 + (now.getMonth() - b.getMonth());
    return `${Math.max(0, months)} m`;
  }
  return `${years} anos`;
}

function labelParentage(p: NonNullable<Child['parentage']>): string {
  return (
    {
      biologico_ambos: 'biológico',
      biologico_um: 'biológico (um)',
      adotado: 'adotado',
      enteado: 'enteado',
    }[p] ?? p
  );
}
function labelLivesWith(w: NonNullable<Child['livesWith']>): string {
  return (
    {
      conosco: 'conosco',
      pai: 'com o pai',
      mae: 'com a mãe',
      alternado: 'alternado',
    }[w] ?? w
  );
}
