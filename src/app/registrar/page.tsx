'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { registerInput, type RegisterInput } from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerInput),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await apiClient('/api/auth/register', { method: 'POST', body: JSON.stringify(values) });
      await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      toast.success('Conta criada! Vamos preparar seu perfil.');
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'EMAIL_TAKEN') toast.error('Este e-mail já está cadastrado.');
      else if (e.code === 'PHONE_TAKEN') toast.error('Este telefone já está cadastrado.');
      else toast.error(e.message ?? 'Erro ao criar conta.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-muted/30">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Criar sua conta</h1>
        <p className="text-sm text-muted-foreground mt-1">Vai levar 1 minuto.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <input
              id="name"
              autoComplete="name"
              {...register('name')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {formState.errors.name && (
              <p className="text-xs text-destructive">{formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {formState.errors.email && (
              <p className="text-xs text-destructive">{formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">Telefone (com DDI)</label>
            <input
              id="phone"
              placeholder="+5511999999999"
              autoComplete="tel"
              {...register('phone')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {formState.errors.phone && (
              <p className="text-xs text-destructive">{formState.errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {formState.errors.password && (
              <p className="text-xs text-destructive">{formState.errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full inline-flex h-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {formState.isSubmitting ? 'Criando...' : 'Criar conta'}
          </button>
          <p className="text-sm text-center text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/entrar" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
