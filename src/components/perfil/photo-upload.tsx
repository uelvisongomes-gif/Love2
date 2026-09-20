'use client';
import { useRef, useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { compressImage } from '@/lib/image';

interface Props {
  photoUrl: string | null;
  name: string;
  onChange: (url: string | null) => void;
}

export function PhotoUpload({ photoUrl, name, onChange }: Props): React.ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      await apiClient('/api/me/photo', { method: 'PUT', body: JSON.stringify({ photoUrl: dataUrl }) });
      onChange(dataUrl);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Erro ao enviar foto');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async (): Promise<void> => {
    setErr(null);
    setUploading(true);
    try {
      await apiClient('/api/me/photo', { method: 'DELETE' });
      onChange(null);
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Erro ao remover foto');
    } finally {
      setUploading(false);
    }
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <div className="w-20 h-20 rounded-full bg-surface border border-rule overflow-hidden flex items-center justify-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : initials ? (
            <span className="font-display text-xl text-primary">{initials}</span>
          ) : (
            <User className="w-8 h-8 text-muted" />
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-[hsl(var(--primary-fg))] flex items-center justify-center shadow-sm border-2 border-bg disabled:opacity-50"
          aria-label="Trocar foto"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text">Sua foto</p>
        <p className="text-xs text-muted mt-0.5">
          {uploading ? 'Enviando…' : 'Aparece pra você e pro seu parceiro. Fica pequenininha (~30KB).'}
        </p>
        {photoUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted hover:text-danger"
          >
            <Trash2 className="w-3 h-3" />
            Remover
          </button>
        )}
        {err && <p className="mt-1 text-xs text-danger">{err}</p>}
      </div>
    </div>
  );
}
