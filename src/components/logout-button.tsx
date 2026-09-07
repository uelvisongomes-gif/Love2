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
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  );
}
