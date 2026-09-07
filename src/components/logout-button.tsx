'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function LogoutButton() {
  const router = useRouter();
  async function onClick() {
    await apiClient('/api/auth/logout', { method: 'POST' });
    router.push('/entrar');
    router.refresh();
  }
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full h-9 px-3.5 text-sm text-muted hover:bg-surface hover:text-heading transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}
