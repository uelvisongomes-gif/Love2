'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { loginInput, type LoginInput } from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';
import { RingsLogo } from '@/components/rings-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginInput),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    try {
      await apiClient('/api/auth/login', { method: 'POST', body: JSON.stringify(values) });
      toast.success('Bem-vinda(o) de volta.');
      router.push('/home');
      router.refresh();
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVALID_CREDENTIALS') toast.error('E-mail ou senha inválidos.');
      else toast.error(e.message ?? 'Erro ao entrar.');
    }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      <div className="w-full border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg text-heading">
            <RingsLogo size={32} />
            love2
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="type-eyebrow mb-3">— entrar</p>
            <h1 className="font-display text-4xl text-heading tracking-tight mb-2">
              Que bom te ver.
            </h1>
            <p className="text-sm text-muted">Use o e-mail que você cadastrou.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {formState.errors.email && (
                <p className="text-xs text-danger">{formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {formState.errors.password && (
                <p className="text-xs text-danger">{formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-sm text-center pt-1">
              <Link href="/esqueci" className="text-muted hover:text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </p>
            <p className="text-sm text-center text-muted pt-2">
              Não tem conta ainda?{' '}
              <Link href="/registrar" className="text-primary hover:underline font-semibold">
                Criar conta
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
