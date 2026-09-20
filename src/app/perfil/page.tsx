'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { PhotoUpload } from '@/components/perfil/photo-upload';
import { ChildrenList } from '@/components/perfil/children-list';
import { apiClient } from '@/lib/api-client';
import { Save, Sparkles } from 'lucide-react';

interface Me {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string | null;
}

interface ProfileData {
  birthDate: string | null;
  gender: 'mulher' | 'homem' | 'naobinario' | 'prefiro_nao_dizer' | null;
  occupation: string | null;
  location: string | null;
  healthNotes: string | null;
  civilStatus: 'namoro' | 'noivado' | 'casados' | 'uniao_estavel' | null;
  relationshipStart: string | null;
  howMet: string | null;
  relationshipYears: number | null;
  hasChildren: boolean | null;
  livingTogether: boolean | null;
}

const emptyProfile: ProfileData = {
  birthDate: null,
  gender: null,
  occupation: null,
  location: null,
  healthNotes: null,
  civilStatus: null,
  relationshipStart: null,
  howMet: null,
  relationshipYears: null,
  hasChildren: null,
  livingTogether: null,
};

export default function PerfilPage(): React.ReactElement {
  const [me, setMe] = useState<Me | null>(null);
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<'personal' | 'relationship' | null>(null);
  const [savedFlash, setSavedFlash] = useState<'personal' | 'relationship' | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [meRes, profileRes] = await Promise.all([
          apiClient<Me>('/api/me'),
          apiClient<ProfileData & Record<string, unknown>>('/api/profile').catch(() => null),
        ]);
        setMe(meRes);
        if (profileRes) {
          setProfile({
            ...emptyProfile,
            ...profileRes,
            birthDate: profileRes.birthDate ? String(profileRes.birthDate).slice(0, 10) : null,
            relationshipStart: profileRes.relationshipStart
              ? String(profileRes.relationshipStart).slice(0, 10)
              : null,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSection = useCallback(
    async (section: 'personal' | 'relationship'): Promise<void> => {
      setSaving(section);
      try {
        const payload =
          section === 'personal'
            ? {
                birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString() : null,
                gender: profile.gender,
                occupation: profile.occupation,
                location: profile.location,
                healthNotes: profile.healthNotes,
              }
            : {
                civilStatus: profile.civilStatus,
                relationshipStart: profile.relationshipStart
                  ? new Date(profile.relationshipStart).toISOString()
                  : null,
                howMet: profile.howMet,
                relationshipYears: profile.relationshipYears,
                livingTogether: profile.livingTogether,
                hasChildren: profile.hasChildren,
              };
        await apiClient('/api/profile', { method: 'PUT', body: JSON.stringify(payload) });
        setSavedFlash(section);
        setTimeout(() => setSavedFlash(null), 2000);
      } finally {
        setSaving(null);
      }
    },
    [profile],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <AppHeader />
        <main className="max-w-2xl mx-auto p-6 text-sm text-muted">carregando…</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-6 md:py-10 space-y-5">
        <header className="mb-2">
          <p className="type-eyebrow mb-1">— meu perfil</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            {me?.name?.split(' ')[0]}, quem é você?
          </h1>
          <p className="mt-2 text-sm text-text/80 max-w-[52ch] leading-relaxed">
            Quanto mais LOVE souber, melhor ela cuida. Preencha do jeito que quiser, na hora que
            quiser.
          </p>
        </header>

        {/* FOTO */}
        <section className="rounded-2xl border border-rule bg-surface p-5">
          <PhotoUpload
            photoUrl={me?.photoUrl ?? null}
            name={me?.name ?? ''}
            onChange={(url) => setMe((prev) => (prev ? { ...prev, photoUrl: url } : prev))}
          />
        </section>

        {/* DADOS PESSOAIS */}
        <section className="rounded-2xl border border-rule bg-surface p-5">
          <SectionHeader title="Sobre você" hint="dados pessoais" />
          <div className="grid gap-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nascimento">
                <input
                  type="date"
                  value={profile.birthDate ?? ''}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, birthDate: e.target.value || null }))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Gênero">
                <select
                  value={profile.gender ?? ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      gender: (e.target.value || null) as ProfileData['gender'],
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">—</option>
                  <option value="mulher">Mulher</option>
                  <option value="homem">Homem</option>
                  <option value="naobinario">Não-binário</option>
                  <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                </select>
              </Field>
            </div>
            <Field label="Ocupação">
              <input
                type="text"
                value={profile.occupation ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, occupation: e.target.value || null }))
                }
                className={inputCls}
                placeholder="Ex: designer, professora, dev"
              />
            </Field>
            <Field label="Onde vive">
              <input
                type="text"
                value={profile.location ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, location: e.target.value || null }))
                }
                className={inputCls}
                placeholder="Ex: São Paulo, SP"
              />
            </Field>
            <Field label="Saúde — condições, remédios, alergias">
              <textarea
                value={profile.healthNotes ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, healthNotes: e.target.value || null }))
                }
                className={`${inputCls} min-h-[80px] py-2 resize-y`}
                placeholder="Ex: ansiedade, uso sertralina; enxaqueca crônica"
              />
              <span className="mt-1 block text-[11px] text-muted">
                LOVE usa isso pra entender oscilações de humor e cuidar melhor.
              </span>
            </Field>
          </div>
          <div className="flex justify-end mt-4">
            <SaveBtn
              saving={saving === 'personal'}
              saved={savedFlash === 'personal'}
              onClick={() => void saveSection('personal')}
            />
          </div>
        </section>

        {/* RELACIONAMENTO */}
        <section className="rounded-2xl border border-rule bg-surface p-5">
          <SectionHeader title="Relacionamento" hint="como é hoje" />
          <div className="grid gap-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Situação">
                <select
                  value={profile.civilStatus ?? ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      civilStatus: (e.target.value || null) as ProfileData['civilStatus'],
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">—</option>
                  <option value="namoro">Namoro</option>
                  <option value="noivado">Noivado</option>
                  <option value="casados">Casados</option>
                  <option value="uniao_estavel">União estável</option>
                </select>
              </Field>
              <Field label="Juntos desde">
                <input
                  type="date"
                  value={profile.relationshipStart ?? ''}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, relationshipStart: e.target.value || null }))
                  }
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Moram juntos">
                <select
                  value={
                    profile.livingTogether == null
                      ? ''
                      : profile.livingTogether
                        ? 'yes'
                        : 'no'
                  }
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      livingTogether: e.target.value === '' ? null : e.target.value === 'yes',
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">—</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                </select>
              </Field>
              <Field label="Têm filhos">
                <select
                  value={
                    profile.hasChildren == null ? '' : profile.hasChildren ? 'yes' : 'no'
                  }
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      hasChildren: e.target.value === '' ? null : e.target.value === 'yes',
                    }))
                  }
                  className={inputCls}
                >
                  <option value="">—</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                </select>
              </Field>
            </div>
            <Field label="Como se conheceram">
              <textarea
                value={profile.howMet ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, howMet: e.target.value || null }))}
                className={`${inputCls} min-h-[70px] py-2 resize-y`}
                placeholder="Uma frase, uma história — o que quiser"
              />
            </Field>
          </div>
          <div className="flex justify-end mt-4">
            <SaveBtn
              saving={saving === 'relationship'}
              saved={savedFlash === 'relationship'}
              onClick={() => void saveSection('relationship')}
            />
          </div>
        </section>

        {/* FILHOS */}
        {profile.hasChildren !== false && <ChildrenList />}

        {/* PROGRESSIVE HINT */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-text/80 leading-relaxed">
            <strong className="font-semibold">Aos poucos.</strong> Você não precisa preencher tudo agora. LOVE vai perguntando ao longo das
            conversas e enriquecendo o perfil junto.
          </p>
        </div>

        <div className="pt-2 flex justify-between text-xs">
          <Link href="/onboarding" className="text-muted hover:text-primary underline">
            Refazer onboarding
          </Link>
          <Link href="/parceiro" className="text-muted hover:text-primary underline">
            Vincular parceiro
          </Link>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  'w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50';

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

function SectionHeader({ title, hint }: { title: string; hint: string }): React.ReactElement {
  return (
    <div>
      <p className="type-eyebrow text-[10px] uppercase tracking-wider mb-1 not-italic font-semibold">
        {hint}
      </p>
      <h2 className="font-display italic text-xl text-heading tracking-tight">{title}</h2>
    </div>
  );
}

function SaveBtn({
  saving,
  saved,
  onClick,
}: {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold transition-colors ${
        saved
          ? 'bg-green-600 text-white'
          : 'bg-primary text-[hsl(var(--primary-fg))] hover:opacity-90'
      } disabled:opacity-50`}
    >
      <Save className="w-3.5 h-3.5" />
      {saving ? 'Salvando…' : saved ? 'Salvo!' : 'Salvar'}
    </button>
  );
}
